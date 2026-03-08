import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";

export async function trackDayView(
  tripId: string,
  uid: string,
  dayNumber: number
) {
  try {
    const db = getFirebaseDb();
    const ref = doc(db, "analytics", tripId, "views", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const data = snap.data();
      const daysUnlocked: number[] = data.daysUnlocked || [];
      if (!daysUnlocked.includes(dayNumber)) {
        daysUnlocked.push(dayNumber);
      }
      await setDoc(
        ref,
        {
          lastViewedAt: Timestamp.now(),
          viewCount: (data.viewCount || 0) + 1,
          daysUnlocked,
        },
        { merge: true }
      );
    } else {
      await setDoc(ref, {
        viewedAt: Timestamp.now(),
        lastViewedAt: Timestamp.now(),
        viewCount: 1,
        daysUnlocked: [dayNumber],
        totalTimeSeconds: 0,
      });
    }
  } catch (err) {
    // Firestore permissions may not be deployed yet — fail silently
    console.warn("Analytics tracking failed:", err);
  }
}
