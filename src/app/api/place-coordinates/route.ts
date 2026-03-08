import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getAdminDb(): Promise<FirebaseFirestore.Firestore | null> {
  const hasCredentials =
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!hasCredentials) return null;

  try {
    const { adminDb } = await import("@/lib/firebase-admin");
    return adminDb;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Route handler — POST { placeIds: string[] }
// Returns Record<string, { lat: number; lng: number }>
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  let body: { placeIds?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const placeIds = body.placeIds;
  if (!Array.isArray(placeIds) || placeIds.length === 0) {
    return NextResponse.json(
      { error: "placeIds must be a non-empty array" },
      { status: 400 }
    );
  }

  // Cap at 50 to prevent abuse
  const ids = placeIds.slice(0, 50);
  const result: Record<string, { lat: number; lng: number }> = {};
  const uncached: string[] = [];

  const db = await getAdminDb();

  // 1. Check Firestore cache for existing coordinates
  if (db) {
    try {
      // Firestore getAll supports up to 500 docs
      const refs = ids.map((id) =>
        db.collection("google-places-cache").doc(id)
      );
      const docs = await db.getAll(...refs);

      for (let i = 0; i < docs.length; i++) {
        const doc = docs[i];
        if (doc.exists) {
          const data = doc.data();
          if (data?.location?.latitude != null && data?.location?.longitude != null) {
            result[ids[i]] = {
              lat: data.location.latitude,
              lng: data.location.longitude,
            };
            continue;
          }
        }
        uncached.push(ids[i]);
      }
    } catch {
      // If cache read fails, treat all as uncached
      uncached.push(...ids.filter((id) => !result[id]));
    }
  } else {
    uncached.push(...ids);
  }

  // 2. Fetch uncached coordinates from Google Places API (minimal FieldMask)
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (apiKey && uncached.length > 0) {
    const fetches = uncached.map(async (placeId) => {
      try {
        const url = `https://places.googleapis.com/v1/places/${placeId}`;
        const res = await fetch(url, {
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "location",
          },
        });

        if (!res.ok) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = await res.json();
        if (data.location?.latitude != null && data.location?.longitude != null) {
          const coords = {
            lat: data.location.latitude,
            lng: data.location.longitude,
          };
          result[placeId] = coords;

          // Cache the location in Firestore
          if (db) {
            try {
              await db
                .collection("google-places-cache")
                .doc(placeId)
                .set(
                  { location: data.location, cachedAt: new Date() },
                  { merge: true }
                );
            } catch {
              // Non-critical
            }
          }
        }
      } catch {
        // Skip this place
      }
    });

    await Promise.all(fetches);
  }

  return NextResponse.json(result);
}
