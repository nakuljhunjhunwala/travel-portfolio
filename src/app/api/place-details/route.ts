import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlaceDetails {
  displayName: string;
  formattedAddress: string;
  rating?: number;
  userRatingCount?: number;
  openingHours?: string[];
  isOpenNow?: boolean;
  websiteUri?: string;
  googleMapsUri?: string;
  types?: string[];
  photoUrl?: string;
  editorialSummary?: string;
  geminiSummary?: string;
  location?: { latitude: number; longitude: number };
  source: "google" | "fallback";
}

interface CachedPlaceDetails extends PlaceDetails {
  cachedAt: FirebaseFirestore.Timestamp | Date;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FIELD_MASK = [
  "displayName",
  "formattedAddress",
  "rating",
  "userRatingCount",
  "regularOpeningHours",
  "websiteUri",
  "googleMapsUri",
  "types",
  "photos",
  "editorialSummary",
  "location",
].join(",");

/** Cache entries older than 30 days are considered stale. */
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Safely get a Firestore Admin instance. Returns null if credentials are
 * missing or initialisation fails so the endpoint can still respond with a
 * fallback.
 */
async function getAdminDb(): Promise<FirebaseFirestore.Firestore | null> {
  const hasCredentials =
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (!hasCredentials) return null;

  try {
    const { adminDb } = await import("@/lib/firebase-admin");
    return adminDb;
  } catch (err) {
    console.warn("Firebase Admin unavailable, skipping cache:", err);
    return null;
  }
}

/**
 * Check if a cached entry is still fresh (< 30 days old).
 */
function isCacheFresh(cachedAt: FirebaseFirestore.Timestamp | Date): boolean {
  const cachedMs =
    cachedAt instanceof Date
      ? cachedAt.getTime()
      : cachedAt.toDate().getTime();
  return Date.now() - cachedMs < CACHE_TTL_MS;
}

/**
 * Given a Google Places photo resource name, follow the redirect to obtain
 * the actual image URL.
 */
async function resolvePhotoUrl(
  photoName: string,
  apiKey: string
): Promise<string | undefined> {
  try {
    const mediaUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=600&key=${apiKey}`;
    const res = await fetch(mediaUrl, { redirect: "follow" });
    if (res.ok) return res.url;
  } catch (err) {
    console.warn("Failed to resolve photo URL:", err);
  }
  return undefined;
}

/**
 * Strip `undefined` values from an object so Firestore doesn't choke.
 */
function stripUndefined(obj: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) clean[key] = value;
  }
  return clean;
}

/**
 * Generate (or retrieve cached) Gemini summary for a place.
 */
async function getGeminiSummary(
  placeId: string,
  placeName: string,
  placeCity: string,
  db: FirebaseFirestore.Firestore | null
): Promise<string | undefined> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) return undefined;

  // 1. Check gemini cache
  if (db) {
    try {
      const cached = await db.collection("gemini-cache").doc(placeId).get();
      if (cached.exists && cached.data()?.geminiSummary) {
        return cached.data()!.geminiSummary as string;
      }
    } catch (err) {
      console.warn("Gemini cache read failed:", err);
    }
  }

  // Also check legacy "places" collection used by /api/place-summary
  if (db) {
    try {
      const legacy = await db.collection("places").doc(placeId).get();
      if (legacy.exists && legacy.data()?.geminiSummary) {
        return legacy.data()!.geminiSummary as string;
      }
    } catch (err) {
      console.warn("Legacy places cache read failed:", err);
    }
  }

  // 2. Call Gemini
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const cityContext = placeCity ? ` in ${placeCity}, India` : " in India";
    const result = await model.generateContent(
      `Write a 2-sentence factual summary of ${placeName}${cityContext}. ` +
        `Include what it is, why it's significant, and one practical visitor tip. ` +
        `Keep it under 40 words. No markdown.`
    );

    const summary = result.response.text();

    // 3. Cache in both collections
    if (db) {
      const cacheData = {
        name: placeName,
        geminiSummary: summary,
        cachedAt: new Date(),
      };
      try {
        await Promise.all([
          db.collection("gemini-cache").doc(placeId).set(cacheData, { merge: true }),
          db.collection("places").doc(placeId).set(cacheData, { merge: true }),
        ]);
      } catch (err) {
        console.warn("Gemini cache write failed:", err);
      }
    }

    return summary;
  } catch (err) {
    console.error("Gemini API call failed:", err);
    return undefined;
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const placeId = req.nextUrl.searchParams.get("placeId");
  const placeName = req.nextUrl.searchParams.get("placeName");
  const placeCity = req.nextUrl.searchParams.get("placeCity") ?? "";

  // --- Validate required params ---
  if (!placeId || !placeName) {
    return NextResponse.json(
      { error: "Missing required query params: placeId, placeName" },
      { status: 400 }
    );
  }

  const db = await getAdminDb();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  // --- 1. Check Firestore cache ---
  if (db) {
    try {
      const doc = await db.collection("google-places-cache").doc(placeId).get();
      if (doc.exists) {
        const data = doc.data() as CachedPlaceDetails;
        if (data.cachedAt && isCacheFresh(data.cachedAt)) {
          let needsCacheUpdate = false;
          const updates: Record<string, unknown> = {};

          // Enrich with Gemini summary if missing
          if (!data.geminiSummary && placeCity) {
            const gemini = await getGeminiSummary(placeId, placeName, placeCity, db);
            if (gemini) {
              data.geminiSummary = gemini;
              updates.geminiSummary = gemini;
              needsCacheUpdate = true;
            }
          }

          // Retry Google Places photo if we don't have one cached
          if (!data.photoUrl && apiKey) {
            try {
              const url = `https://places.googleapis.com/v1/places/${placeId}`;
              const res = await fetch(url, {
                headers: {
                  "X-Goog-Api-Key": apiKey,
                  "X-Goog-FieldMask": "photos",
                },
              });
              if (res.ok) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const photoData: any = await res.json();
                if (photoData.photos?.length) {
                  const photoUrl = await resolvePhotoUrl(photoData.photos[0].name, apiKey);
                  if (photoUrl) {
                    data.photoUrl = photoUrl;
                    updates.photoUrl = photoUrl;
                    needsCacheUpdate = true;
                  }
                }
              }
            } catch {
              // Non-critical — continue with cached data
            }
          }

          // Persist any enrichments back to cache
          if (needsCacheUpdate) {
            try {
              await db.collection("google-places-cache").doc(placeId).update(updates);
            } catch {
              // Non-critical
            }
          }

          // Strip internal cachedAt before returning
          const { cachedAt: _, ...rest } = data;
          return NextResponse.json(rest);
        }
      }
    } catch (err) {
      console.warn("Cache read failed, proceeding without cache:", err);
    }
  }

  // --- 2. Fetch from Google Places API v1 ---
  if (!apiKey) {
    // No API key — return fallback
    const geminiSummary = await getGeminiSummary(placeId, placeName, placeCity, db);
    const fallback: PlaceDetails = {
      displayName: placeName,
      formattedAddress: "",
      source: "fallback",
      ...(geminiSummary ? { geminiSummary } : {}),
    };
    return NextResponse.json(fallback);
  }

  try {
    const url = `https://places.googleapis.com/v1/places/${placeId}`;
    const res = await fetch(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
    });

    if (!res.ok) {
      console.error(
        `Google Places API error (${res.status}):`,
        await res.text()
      );
      const geminiSummary = await getGeminiSummary(placeId, placeName, placeCity, db);
      const fallback: PlaceDetails = {
        displayName: placeName,
        formattedAddress: "",
        source: "fallback",
        ...(geminiSummary ? { geminiSummary } : {}),
      };
      return NextResponse.json(fallback);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await res.json();

    // --- 3. Extract & structure response ---
    const photoUrl = data.photos?.length
      ? await resolvePhotoUrl(data.photos[0].name, apiKey)
      : undefined;

    const geminiSummary = await getGeminiSummary(placeId, placeName, placeCity, db);

    const details: PlaceDetails = {
      displayName: data.displayName?.text ?? placeName,
      formattedAddress: data.formattedAddress ?? "",
      rating: data.rating,
      userRatingCount: data.userRatingCount,
      openingHours: data.regularOpeningHours?.weekdayDescriptions,
      isOpenNow: data.regularOpeningHours?.openNow,
      websiteUri: data.websiteUri,
      googleMapsUri: data.googleMapsUri,
      types: data.types,
      photoUrl,
      editorialSummary: data.editorialSummary?.text,
      geminiSummary,
      location: data.location
        ? { latitude: data.location.latitude, longitude: data.location.longitude }
        : undefined,
      source: "google",
    };

    // --- 4. Cache in Firestore (strip undefined values) ---
    if (db) {
      try {
        const cacheData = stripUndefined({
          ...details,
          cachedAt: new Date(),
        });
        await db
          .collection("google-places-cache")
          .doc(placeId)
          .set(cacheData, { merge: true });
      } catch (err) {
        console.warn("Firestore cache write failed:", err);
      }
    }

    return NextResponse.json(details);
  } catch (err) {
    console.error("Google Places API call failed:", err);
    const geminiSummary = await getGeminiSummary(placeId, placeName, placeCity, db);
    const fallback: PlaceDetails = {
      displayName: placeName,
      formattedAddress: "",
      source: "fallback",
      ...(geminiSummary ? { geminiSummary } : {}),
    };
    return NextResponse.json(fallback);
  }
}
