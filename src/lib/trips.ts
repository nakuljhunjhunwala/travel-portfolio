import type { Trip, Day, Place } from "@/types";
import { adminDb } from "./firebase-admin";

/* ── Helpers ── */

/**
 * Convert Admin SDK Timestamp instances to plain { seconds, nanoseconds }
 * so they serialize correctly when passed from Server → Client Components.
 */
function serializeTimestamps<T>(data: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === "object" && "toDate" in value) {
      // Firestore Timestamp — convert to plain object
      const ts = value as unknown as { seconds: number; nanoseconds: number };
      result[key] = { seconds: ts.seconds, nanoseconds: ts.nanoseconds };
    } else if (value && typeof value === "object" && !Array.isArray(value)) {
      result[key] = serializeTimestamps(value as Record<string, unknown>);
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => {
        if (item && typeof item === "object" && "toDate" in item) {
          return { seconds: item.seconds, nanoseconds: item.nanoseconds };
        }
        if (item && typeof item === "object" && !Array.isArray(item)) {
          return serializeTimestamps(item as Record<string, unknown>);
        }
        return item;
      });
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

/* ── Data fetchers ── */

/** Trips visible to users: published + coming_soon (excludes drafts). */
export async function getVisibleTrips(): Promise<Trip[]> {
  const snap = await adminDb
    .collection("trips")
    .where("status", "in", ["published", "coming_soon"])
    .get();

  return snap.docs.map((doc) =>
    serializeTimestamps<Trip>({ id: doc.id, ...doc.data() })
  );
}

/** Only fully-published trips (with itineraries). */
export async function getPublishedTrips(): Promise<Trip[]> {
  const snap = await adminDb
    .collection("trips")
    .where("status", "==", "published")
    .get();

  return snap.docs.map((doc) =>
    serializeTimestamps<Trip>({ id: doc.id, ...doc.data() })
  );
}

export async function getAllTrips(): Promise<Trip[]> {
  const snap = await adminDb.collection("trips").get();
  return snap.docs.map((doc) =>
    serializeTimestamps<Trip>({ id: doc.id, ...doc.data() })
  );
}

export async function getTripBySlug(slug: string): Promise<Trip | undefined> {
  const snap = await adminDb
    .collection("trips")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snap.empty) return undefined;
  const doc = snap.docs[0];
  return serializeTimestamps<Trip>({ id: doc.id, ...doc.data() });
}

export async function getDaysForTrip(tripId: string): Promise<Day[]> {
  const snap = await adminDb
    .collection("trips")
    .doc(tripId)
    .collection("days")
    .orderBy("dayNumber")
    .get();

  return snap.docs.map((doc) =>
    serializeTimestamps<Day>({ id: doc.id, ...doc.data() })
  );
}

export async function getPlacesForDay(
  tripId: string,
  dayId: string
): Promise<Place[]> {
  const snap = await adminDb
    .collection("trips")
    .doc(tripId)
    .collection("days")
    .doc(dayId)
    .collection("places")
    .orderBy("index")
    .get();

  return snap.docs.map((doc) =>
    serializeTimestamps<Place>({ id: doc.id, ...doc.data() })
  );
}
