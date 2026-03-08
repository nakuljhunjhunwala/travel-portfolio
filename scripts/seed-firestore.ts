/**
 * Firestore Seed Script
 *
 * Seeds Firestore with mock trip data from src/data/.
 * Run with: npx tsx scripts/seed-firestore.ts
 *
 * Requires .env.local with:
 *   NEXT_PUBLIC_FIREBASE_PROJECT_ID
 *   FIREBASE_ADMIN_CLIENT_EMAIL
 *   FIREBASE_ADMIN_PRIVATE_KEY
 */

import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local from project root
config({ path: resolve(__dirname, "../.env.local") });

import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Initialize Firebase Admin SDK (standalone — not using the Next.js lib)
if (getApps().length === 0) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
  );

  if (!projectId || !clientEmail || !privateKey) {
    console.error("Missing Firebase Admin credentials in .env.local");
    console.error("Required:");
    console.error("  NEXT_PUBLIC_FIREBASE_PROJECT_ID");
    console.error("  FIREBASE_ADMIN_CLIENT_EMAIL");
    console.error("  FIREBASE_ADMIN_PRIVATE_KEY");
    process.exit(1);
  }

  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const db = getFirestore();

// ---------------------------------------------------------------------------
// Import mock data
// ---------------------------------------------------------------------------
import { mockTrips } from "../src/data/mock-trips";
import { mockDays } from "../src/data/mock-days";
import { mockPlaces } from "../src/data/mock-places";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Convert { seconds, nanoseconds } objects to real Firestore Timestamps.
 */
function toTimestamp(value: unknown): Timestamp | unknown {
  if (
    value !== null &&
    typeof value === "object" &&
    "seconds" in (value as Record<string, unknown>) &&
    "nanoseconds" in (value as Record<string, unknown>)
  ) {
    const v = value as { seconds: number; nanoseconds: number };
    return new Timestamp(v.seconds, v.nanoseconds);
  }
  return value;
}

/**
 * Deep-walk an object and convert any Timestamp-like values.
 * Returns a new object (does not mutate the original).
 */
function convertTimestamps<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const converted = toTimestamp(value);
      if (converted instanceof Timestamp) {
        result[key] = converted;
      } else {
        // Recurse into nested objects (e.g. travelToNext, tripDNA)
        result[key] = convertTimestamps(value as Record<string, unknown>);
      }
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (item !== null && typeof item === "object") {
          const converted = toTimestamp(item);
          return converted instanceof Timestamp
            ? converted
            : convertTimestamps(item as Record<string, unknown>);
        }
        return item;
      });
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

/**
 * Strip the `id` field from an object (doc ID is used as the Firestore
 * document ID, not stored in the document body).
 */
function stripId<T extends { id: string }>(
  obj: T
): Omit<T, "id"> {
  const { id: _id, ...rest } = obj;
  return rest;
}

// ---------------------------------------------------------------------------
// Seed logic
// ---------------------------------------------------------------------------

async function seed() {
  console.log("Starting Firestore seed...\n");

  // Firestore batched writes have a limit of 500 operations per batch.
  // We'll accumulate operations and flush in chunks.
  const MAX_OPS = 499; // leave headroom
  let batch = db.batch();
  let opCount = 0;

  async function flushIfNeeded() {
    if (opCount >= MAX_OPS) {
      await batch.commit();
      console.log(`  (flushed batch — ${opCount} operations)\n`);
      batch = db.batch();
      opCount = 0;
    }
  }

  for (const trip of mockTrips) {
    console.log(`Seeding trip: ${trip.title}`);

    // Write trip document
    const tripRef = db.collection("trips").doc(trip.id);
    const tripData = convertTimestamps(
      stripId(trip) as unknown as Record<string, unknown>
    );
    batch.set(tripRef, tripData);
    opCount++;
    await flushIfNeeded();

    // Write days for this trip
    const days = mockDays[trip.id] ?? [];
    for (const day of days) {
      const dayRef = tripRef.collection("days").doc(day.id);
      const dayData = convertTimestamps(
        stripId(day) as unknown as Record<string, unknown>
      );
      batch.set(dayRef, dayData);
      opCount++;
      await flushIfNeeded();

      // Write places for this day
      const places = mockPlaces[day.id] ?? [];
      const placeCount = places.length;

      for (const place of places) {
        const placeRef = dayRef.collection("places").doc(place.id);
        const placeData = convertTimestamps(
          stripId(place) as unknown as Record<string, unknown>
        );
        batch.set(placeRef, placeData);
        opCount++;
        await flushIfNeeded();
      }

      console.log(
        `  Day ${day.dayNumber}: ${day.dayTitle} (${placeCount} place${placeCount !== 1 ? "s" : ""})`
      );
    }

    if (days.length === 0) {
      console.log("  (no days data)");
    }

    console.log();
  }

  // Final flush
  if (opCount > 0) {
    await batch.commit();
    console.log(`Committed final batch (${opCount} operations)`);
  }

  console.log("Firestore seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
