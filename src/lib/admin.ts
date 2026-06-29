import { adminDb } from "./firebase-admin";

/* ── Types ── */

export interface OverviewStats {
  totalTrips: number;
  publishedTrips: number;
  totalReaders: number;
  /** Distinct readers whose last visit falls in the current calendar month. */
  activeThisMonth: number;
}

export interface TripAnalyticsRow {
  tripSlug: string;
  tripTitle: string;
  status: "published" | "coming_soon" | "draft";
  totalViews: number;
  uniqueReaders: number;
  avgDaysRead: number;
  lastViewAt: string | null; // ISO string
  readers: ReaderRow[];
}

export interface ReaderRow {
  uid: string;
  name: string;
  email: string;
  firstRead: string | null; // ISO string
  daysUnlocked: number;
  lastVisit: string | null; // ISO string
  viewCount: number;
}

export interface AdminAnalytics {
  overview: OverviewStats;
  tripAnalytics: TripAnalyticsRow[];
}

/* ── Helpers ── */

function toISO(ts: FirebaseFirestore.Timestamp | undefined | null): string | null {
  if (!ts || typeof ts.toDate !== "function") return null;
  return ts.toDate().toISOString();
}

/* ── Main fetch ── */

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  // 1. Fetch all trips
  const tripsSnap = await adminDb.collection("trips").get();
  const trips = tripsSnap.docs.map((doc) => ({
    id: doc.id,
    slug: doc.data().slug as string,
    title: doc.data().title as string,
    status: (doc.data().status || (doc.data().published ? "published" : "draft")) as "published" | "coming_soon" | "draft",
  }));

  const totalTrips = trips.length;
  const publishedTrips = trips.filter((t) => t.status === "published").length;

  // 2. Fetch analytics for each trip + collect unique UIDs
  const allReaderUids = new Set<string>();
  const activeThisMonthUids = new Set<string>();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const tripAnalytics: TripAnalyticsRow[] = [];

  for (const trip of trips) {
    const viewsSnap = await adminDb
      .collection("analytics")
      .doc(trip.slug)
      .collection("views")
      .get();

    let totalViews = 0;
    let totalDaysSum = 0;
    let lastViewAt: Date | null = null;
    const readers: {
      uid: string;
      viewedAt: FirebaseFirestore.Timestamp | null;
      lastViewedAt: FirebaseFirestore.Timestamp | null;
      viewCount: number;
      daysUnlocked: number[];
    }[] = [];

    for (const viewDoc of viewsSnap.docs) {
      const data = viewDoc.data();
      const uid = viewDoc.id;
      allReaderUids.add(uid);

      const vc = (data.viewCount as number) || 1;
      totalViews += vc;

      const daysArr = (data.daysUnlocked as number[]) || [];
      totalDaysSum += daysArr.length;

      const lastViewed = data.lastViewedAt as FirebaseFirestore.Timestamp | undefined;
      if (lastViewed && typeof lastViewed.toDate === "function") {
        const d = lastViewed.toDate();
        if (!lastViewAt || d > lastViewAt) lastViewAt = d;
        if (d >= monthStart) activeThisMonthUids.add(uid);
      }

      readers.push({
        uid,
        viewedAt: data.viewedAt || null,
        lastViewedAt: data.lastViewedAt || null,
        viewCount: vc,
        daysUnlocked: daysArr,
      });
    }

    const uniqueReaders = viewsSnap.size;
    const avgDaysRead =
      uniqueReaders > 0 ? Math.round((totalDaysSum / uniqueReaders) * 10) / 10 : 0;

    tripAnalytics.push({
      tripSlug: trip.slug,
      tripTitle: trip.title,
      status: trip.status,
      totalViews,
      uniqueReaders,
      avgDaysRead,
      lastViewAt: lastViewAt ? lastViewAt.toISOString() : null,
      readers: readers.map((r) => ({
        uid: r.uid,
        name: "",
        email: "",
        firstRead: toISO(r.viewedAt),
        daysUnlocked: r.daysUnlocked.length,
        lastVisit: toISO(r.lastViewedAt),
        viewCount: r.viewCount,
      })),
    });
  }

  // 3. Fetch user profiles for all reader UIDs
  const userProfiles = new Map<string, { name: string; email: string }>();
  const uidArray = Array.from(allReaderUids);

  // Firestore `in` queries support max 30 items per batch
  for (let i = 0; i < uidArray.length; i += 30) {
    const batch = uidArray.slice(i, i + 30);
    if (batch.length === 0) continue;

    const usersSnap = await adminDb
      .collection("users")
      .where("__name__", "in", batch)
      .get();

    for (const userDoc of usersSnap.docs) {
      const data = userDoc.data();
      userProfiles.set(userDoc.id, {
        name: (data.name as string) || "Unknown",
        email: (data.email as string) || "",
      });
    }
  }

  // Enrich reader rows with user profile data
  for (const tripRow of tripAnalytics) {
    for (const reader of tripRow.readers) {
      const profile = userProfiles.get(reader.uid);
      if (profile) {
        reader.name = profile.name;
        reader.email = profile.email;
      } else {
        reader.name = "Unknown";
        reader.email = reader.uid;
      }
    }
  }

  // Sort trips by total views descending
  tripAnalytics.sort((a, b) => b.totalViews - a.totalViews);

  return {
    overview: {
      totalTrips,
      publishedTrips,
      totalReaders: allReaderUids.size,
      activeThisMonth: activeThisMonthUids.size,
    },
    tripAnalytics,
  };
}
