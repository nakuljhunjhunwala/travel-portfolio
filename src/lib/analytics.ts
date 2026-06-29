import {
  doc,
  getDoc,
  setDoc,
  arrayUnion,
  increment,
  Timestamp,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

export async function trackDayView(
  tripId: string,
  uid: string,
  dayNumber: number
) {
  try {
    const db = getFirebaseDb();
    const ref = doc(db, "analytics", tripId, "views", uid);

    // Set `viewedAt` (first-read timestamp) only when the doc doesn't exist yet.
    // The counters below are atomic, so the only residual race is on this initial
    // timestamp — harmless, since concurrent first-writes resolve to ~the same instant.
    const snap = await getDoc(ref);
    const firstReadPatch = snap.exists()
      ? {}
      : { viewedAt: Timestamp.now() };

    // Atomic merge — `increment`/`arrayUnion` are conflict-free, so concurrent
    // day-section observers firing on load can't lose counts or dropped days.
    await setDoc(
      ref,
      {
        ...firstReadPatch,
        lastViewedAt: Timestamp.now(),
        viewCount: increment(1),
        daysUnlocked: arrayUnion(dayNumber),
      },
      { merge: true }
    );
  } catch (err) {
    // Firestore permissions may not be deployed yet — fail silently
    console.warn("Analytics tracking failed:", err);
  }
}
