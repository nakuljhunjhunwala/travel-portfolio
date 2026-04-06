/**
 * Fetch Cover Photos Script
 *
 * Calls the local Next.js dev server's place-photo API to fetch
 * real cover photos from Google Places for each trip destination.
 * Then updates Firestore directly.
 *
 * Prerequisites: `pnpm dev` must be running on port 3000.
 * Run with: npx tsx scripts/fetch-cover-photos.ts
 */

import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(__dirname, "../.env.local") });

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (getApps().length === 0) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.error("Missing Firebase Admin credentials in .env.local");
    process.exit(1);
  }

  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const db = getFirestore();
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

if (!API_KEY) {
  console.error("Missing GOOGLE_PLACES_API_KEY in .env.local");
  process.exit(1);
}

// Trip ID → search query for the most photogenic destination
const TRIP_PHOTO_QUERIES: Record<string, string> = {
  "trip-kashmir-2022": "Dal Lake Srinagar",
  "trip-kedarkantha-2023": "Kedarkantha Trek",
  "trip-rajasthan-2023": "City Palace Udaipur",
  "trip-alibaug-2023": "Alibaug Beach",
  "trip-bhopal-2023": "Upper Lake Bhopal",
  "trip-manali-2023": "Solang Valley Manali",
  "trip-south-india-2024": "Ooty Tea Plantation",
  "trip-ujjain-2024": "Mahakaleshwar Temple Ujjain",
  "trip-ahmedabad-2025": "Sabarmati Ashram Ahmedabad",
  "trip-spiti-2025": "Key Monastery Spiti",
  "trip-maharashtra-treks": "Harishchandragad Fort",
  "trip-gokarna-2025": "Om Beach Gokarna",
  "trip-nashik-2026": "Trimbakeshwar Temple Nashik",
};

async function findPlaceAndPhoto(query: string): Promise<string | null> {
  // Step 1: Use Places Text Search to find a place ID
  const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${API_KEY}`;
  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  if (searchData.status !== "OK" || !searchData.results?.length) {
    // Try Places API (New) as fallback
    return findPlaceNewApi(query);
  }

  const place = searchData.results[0];
  if (!place.photos?.length) {
    console.log(` (no photos for place)`);
    return null;
  }

  // Step 2: Build photo URL from photo_reference
  const photoRef = place.photos[0].photo_reference;
  const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photoRef}&key=${API_KEY}`;

  // Step 3: Follow redirect to get final CDN URL
  try {
    const photoRes = await fetch(photoUrl, { redirect: "follow" });
    if (photoRes.ok) {
      return photoRes.url;
    }
  } catch {
    // Fall through
  }

  // Return the API URL itself (it'll redirect when loaded)
  return photoUrl;
}

async function findPlaceNewApi(query: string): Promise<string | null> {
  try {
    const url = "https://places.googleapis.com/v1/places:searchText";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY!,
        "X-Goog-FieldMask": "places.photos",
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 1 }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (!data.places?.[0]?.photos?.length) return null;

    const photoName = data.places[0].photos[0].name;
    const mediaUrl = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1200&key=${API_KEY}`;
    const mediaRes = await fetch(mediaUrl, { redirect: "follow" });
    return mediaRes.ok ? mediaRes.url : null;
  } catch {
    return null;
  }
}

async function main() {
  console.log("Fetching cover photos from Google Places API...\n");

  const results: Record<string, string> = {};

  for (const [tripId, query] of Object.entries(TRIP_PHOTO_QUERIES)) {
    process.stdout.write(`  ${tripId}: "${query}" ...`);

    const photoUrl = await findPlaceAndPhoto(query);

    if (!photoUrl) {
      console.log(" SKIP");
      continue;
    }

    results[tripId] = photoUrl;
    console.log(" OK");

    // Update Firestore trip document
    try {
      await db.collection("trips").doc(tripId).update({ coverPhoto: photoUrl });
    } catch (err) {
      console.log(`    (Firestore update failed: ${err})`);
    }

    // Rate limit
    await new Promise((r) => setTimeout(r, 500));
  }

  const count = Object.keys(results).length;
  const total = Object.keys(TRIP_PHOTO_QUERIES).length;
  console.log(`\nDone! Updated ${count}/${total} trips in Firestore.`);

  if (count > 0) {
    console.log("\n--- Photo URL mapping ---\n");
    for (const [tripId, url] of Object.entries(results)) {
      console.log(`${tripId}:`);
      console.log(`  ${url}\n`);
    }
  }
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
