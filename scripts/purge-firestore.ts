/**
 * Firestore Purge Script
 *
 * Deletes ALL data from Firestore: trips (with days/places subcollections),
 * analytics, users, places cache, and gemini cache.
 *
 * Run with: npx tsx scripts/purge-firestore.ts
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

async function deleteCollection(path: string) {
  const snap = await db.collection(path).get();
  if (snap.empty) return 0;

  const batch = db.batch();
  snap.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  return snap.size;
}

async function purge() {
  console.log("Purging ALL Firestore data...\n");

  // 1. Delete trips and their subcollections (days → places)
  const tripsSnap = await db.collection("trips").get();
  let tripCount = 0;
  let dayCount = 0;
  let placeCount = 0;

  for (const tripDoc of tripsSnap.docs) {
    const daysSnap = await tripDoc.ref.collection("days").get();

    for (const dayDoc of daysSnap.docs) {
      // Delete places under each day
      const placesSnap = await dayDoc.ref.collection("places").get();
      if (!placesSnap.empty) {
        const batch = db.batch();
        placesSnap.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        placeCount += placesSnap.size;
      }
    }

    // Delete days
    if (!daysSnap.empty) {
      const batch = db.batch();
      daysSnap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      dayCount += daysSnap.size;
    }

    tripCount++;
  }

  // Delete trip documents
  if (!tripsSnap.empty) {
    const batch = db.batch();
    tripsSnap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
  console.log(`  Trips: ${tripCount} deleted (${dayCount} days, ${placeCount} places)`);

  // 2. Delete analytics (analytics/{tripSlug}/views/{uid})
  const analyticsSnap = await db.collection("analytics").get();
  let analyticsCount = 0;
  for (const doc of analyticsSnap.docs) {
    const viewsSnap = await doc.ref.collection("views").get();
    if (!viewsSnap.empty) {
      const batch = db.batch();
      viewsSnap.docs.forEach((v) => batch.delete(v.ref));
      await batch.commit();
      analyticsCount += viewsSnap.size;
    }
  }
  if (!analyticsSnap.empty) {
    const batch = db.batch();
    analyticsSnap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }
  console.log(`  Analytics: ${analyticsSnap.size} trip entries, ${analyticsCount} view records deleted`);

  // 3. Delete users
  const usersDeleted = await deleteCollection("users");
  console.log(`  Users: ${usersDeleted} deleted`);

  // 4. Delete places cache (google-places-cache)
  const placeCacheDeleted = await deleteCollection("google-places-cache");
  console.log(`  Places cache: ${placeCacheDeleted} deleted`);

  // 5. Delete gemini cache
  const geminiDeleted = await deleteCollection("gemini-cache");
  console.log(`  Gemini cache: ${geminiDeleted} deleted`);

  // 6. Delete places collection (Gemini summaries)
  const placesSummaryDeleted = await deleteCollection("places");
  console.log(`  Places summaries: ${placesSummaryDeleted} deleted`);

  console.log("\nFirestore purge complete! Database is empty.");
}

purge().catch((err) => {
  console.error("Purge failed:", err);
  process.exit(1);
});
