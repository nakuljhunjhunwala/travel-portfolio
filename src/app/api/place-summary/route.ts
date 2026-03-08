import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * GET /api/place-summary?placeId=xxx&placeName=yyy&placeCity=zzz
 *
 * Returns a 2-sentence Gemini-generated summary for a place.
 * Results are cached in Firestore `places` collection so each
 * unique placeId only triggers one Gemini call ever.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get("placeId");
  const placeName = searchParams.get("placeName");
  const placeCity = searchParams.get("placeCity");

  // 1. Validate query params
  if (!placeId || !placeName || !placeCity) {
    return NextResponse.json(
      { error: "Missing required query params: placeId, placeName, placeCity" },
      { status: 400 }
    );
  }

  // 2. Check if GEMINI_API_KEY is set
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not configured" },
      { status: 500 }
    );
  }

  // 3. Determine if Firebase Admin is available (graceful degradation)
  let adminDb: FirebaseFirestore.Firestore | null = null;
  const hasAdminCredentials =
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (hasAdminCredentials) {
    try {
      const { adminDb: db } = await import("@/lib/firebase-admin");
      adminDb = db;
    } catch (err) {
      console.warn("Firebase Admin unavailable, skipping cache:", err);
    }
  }

  // 4. Check Firestore cache
  if (adminDb) {
    try {
      const cached = await adminDb.collection("places").doc(placeId).get();
      if (cached.exists && cached.data()?.geminiSummary) {
        return NextResponse.json({ summary: cached.data()!.geminiSummary });
      }
    } catch (err) {
      console.warn("Firestore cache read failed, proceeding without cache:", err);
    }
  }

  // 5. Call Gemini
  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    const result = await model.generateContent(
      `Write a 2-sentence factual summary of ${placeName} in ${placeCity}, India. ` +
        `Include what it is, why it's significant, and one practical visitor tip. ` +
        `Keep it under 40 words. No markdown.`
    );

    const summary = result.response.text();

    // 6. Cache in Firestore
    if (adminDb) {
      try {
        await adminDb.collection("places").doc(placeId).set(
          {
            name: placeName,
            geminiSummary: summary,
            cachedAt: new Date(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn("Firestore cache write failed:", err);
      }
    }

    return NextResponse.json({ summary });
  } catch (err) {
    // Gemini call failed — return generic fallback (do NOT cache it)
    console.error("Gemini API call failed:", err);
    const fallback = `A notable destination in ${placeCity}, India.`;
    return NextResponse.json({ summary: fallback });
  }
}
