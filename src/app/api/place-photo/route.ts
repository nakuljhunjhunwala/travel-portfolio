import { NextRequest, NextResponse } from "next/server";
import { fetchPlacePhoto } from "@/lib/photos";

/**
 * GET /api/place-photo?placeName=xxx&placeId=yyy
 *
 * Returns a photo URL for the given place. Checks the google-places-cache
 * in Firestore first (populated by /api/place-details) before falling back
 * to the Google Places photo API or curated Unsplash.
 */
export async function GET(req: NextRequest) {
  const placeName = req.nextUrl.searchParams.get("placeName");
  const placeId = req.nextUrl.searchParams.get("placeId");

  if (!placeName || placeName.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing required query parameter: placeName" },
      { status: 400 }
    );
  }

  // --- Check google-places-cache for a cached photo URL ---
  if (placeId) {
    const hasAdminCredentials =
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (hasAdminCredentials) {
      try {
        const { adminDb } = await import("@/lib/firebase-admin");
        const doc = await adminDb
          .collection("google-places-cache")
          .doc(placeId)
          .get();

        if (doc.exists) {
          const data = doc.data();
          if (data?.photoUrl && typeof data.photoUrl === "string") {
            return NextResponse.json({
              photoUrl: data.photoUrl,
              source: "google" as const,
            });
          }
        }
      } catch (err) {
        console.warn("google-places-cache lookup failed, proceeding:", err);
      }
    }
  }

  // --- Fallback to existing photo fetch logic ---
  const result = await fetchPlacePhoto(placeId ?? "", placeName.trim());

  return NextResponse.json({
    photoUrl: result.url,
    source: result.source,
  });
}
