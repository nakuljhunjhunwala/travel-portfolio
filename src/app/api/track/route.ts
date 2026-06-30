import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import "@/lib/firebase-admin"; // ensure admin app is initialised

/**
 * Server-side analytics ingestion. All writes go through the Admin SDK (which
 * bypasses Firestore security rules), and the uid is taken from a verified
 * Firebase ID token — never trusted from the client. Fire-and-forget from the
 * client; always returns 200 (analytics must never break the page).
 */

const EVENTS = ["essentials", "map", "share", "contact", "copy"] as const;
type Event = (typeof EVENTS)[number];

interface TrackBody {
  tripSlug?: string;
  kind?: "view" | "preview" | "day" | "event";
  dayNumber?: number;
  event?: string;
  idToken?: string;
}

function todayKey(): string {
  // YYYY-MM-DD in UTC — stable bucket for the time series.
  return new Date().toISOString().slice(0, 10);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as TrackBody;
    const slug = typeof body.tripSlug === "string" ? body.tripSlug.slice(0, 120) : "";
    const kind = body.kind;
    if (!slug || !kind) return NextResponse.json({ ok: false });

    // Resolve a trusted uid from the ID token (if provided).
    let uid: string | null = null;
    let name = "";
    let email = "";
    if (body.idToken) {
      try {
        const decoded = await getAuth().verifyIdToken(body.idToken);
        uid = decoded.uid;
        name = (decoded.name as string) || "";
        email = decoded.email || "";
      } catch {
        uid = null; // invalid/expired token → treat as anonymous
      }
    }

    const aggregateRef = adminDb.collection("analytics").doc(slug);
    const day = todayKey();

    // ── Anonymous preview open ──
    if (!uid) {
      await aggregateRef.set(
        {
          previewOpens: FieldValue.increment(1),
          dailyOpens: { [day]: FieldValue.increment(1) },
          lastActivityAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
      return NextResponse.json({ ok: true });
    }

    // ── Authenticated reader ──
    const viewRef = aggregateRef.collection("views").doc(uid);

    if (kind === "view" || kind === "preview") {
      const snap = await viewRef.get(); // Admin SDK read — rules don't apply
      const patch: Record<string, unknown> = {
        name,
        email,
        lastViewedAt: FieldValue.serverTimestamp(),
        viewCount: FieldValue.increment(1),
      };
      if (!snap.exists) patch.firstViewedAt = FieldValue.serverTimestamp();
      await viewRef.set(patch, { merge: true });
      await aggregateRef.set(
        {
          readerOpens: FieldValue.increment(1),
          dailyOpens: { [day]: FieldValue.increment(1) },
          lastActivityAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } else if (kind === "day" && typeof body.dayNumber === "number") {
      await viewRef.set(
        {
          name,
          email,
          daysViewed: FieldValue.arrayUnion(body.dayNumber),
          lastViewedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    } else if (kind === "event" && EVENTS.includes(body.event as Event)) {
      await viewRef.set(
        {
          name,
          email,
          engagement: { [body.event as Event]: FieldValue.increment(1) },
          lastViewedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    // Never surface analytics errors to the client.
    return NextResponse.json({ ok: false });
  }
}
