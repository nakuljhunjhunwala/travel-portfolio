import type { User } from "firebase/auth";

export type TrackEvent = "essentials" | "map" | "share" | "contact" | "copy";

interface TrackOpts {
  tripSlug: string;
  kind: "view" | "preview" | "day" | "event";
  dayNumber?: number;
  event?: TrackEvent;
  /** Pass the signed-in user so the server can verify a trusted uid; omit for anonymous. */
  user?: User | null;
}

/**
 * Fire-and-forget analytics. Posts to /api/track, which writes via the Admin SDK
 * (server-trusted uid from the ID token). Never throws; analytics must not break the page.
 */
export async function track(opts: TrackOpts): Promise<void> {
  try {
    let idToken: string | undefined;
    if (opts.user) {
      idToken = await opts.user.getIdToken().catch(() => undefined);
    }
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tripSlug: opts.tripSlug,
        kind: opts.kind,
        dayNumber: opts.dayNumber,
        event: opts.event,
        idToken,
      }),
      keepalive: true,
    });
  } catch {
    // ignore — analytics is best-effort
  }
}
