import { adminDb } from "./firebase-admin";

/* ── Types ── */

export interface OverviewStats {
  totalTrips: number;
  publishedTrips: number;
  totalReaders: number;
  activeThisMonth: number;
  totalPreviewOpens: number;
}

export interface TripSummaryRow {
  tripSlug: string;
  tripTitle: string;
  status: "published" | "coming_soon" | "draft";
  readers: number;
  totalViews: number;
  previewOpens: number;
  lastActivityAt: string | null; // ISO
}

export interface AdminAnalytics {
  overview: OverviewStats;
  trips: TripSummaryRow[];
}

export interface Engagement {
  essentials: number;
  map: number;
  share: number;
  contact: number;
  copy: number;
}

export interface ReaderRow {
  uid: string;
  name: string;
  email: string;
  firstViewedAt: string | null; // ISO
  lastViewedAt: string | null; // ISO
  viewCount: number;
  daysReached: number;
  engagement: Engagement;
}

export interface TripAnalyticsDetail {
  tripSlug: string;
  tripTitle: string;
  status: "published" | "coming_soon" | "draft";
  previewOpens: number;
  readerOpens: number;
  totalReaders: number;
  totalViews: number;
  lastActivityAt: string | null; // ISO
  dailyOpens: { date: string; count: number }[];
  dayFunnel: { day: number; readers: number }[];
  engagement: Engagement;
  readers: ReaderRow[];
}

/* ── Helpers ── */

type Ts = FirebaseFirestore.Timestamp | undefined | null;

function toISO(ts: Ts): string | null {
  if (!ts || typeof ts.toDate !== "function") return null;
  return ts.toDate().toISOString();
}

function emptyEngagement(): Engagement {
  return { essentials: 0, map: 0, share: 0, contact: 0, copy: 0 };
}

function readEngagement(raw: unknown): Engagement {
  const e = emptyEngagement();
  if (raw && typeof raw === "object") {
    for (const k of Object.keys(e) as (keyof Engagement)[]) {
      const v = (raw as Record<string, unknown>)[k];
      if (typeof v === "number") e[k] = v;
    }
  }
  return e;
}

async function listTrips() {
  const snap = await adminDb.collection("trips").get();
  return snap.docs.map((d) => ({
    id: d.id,
    slug: (d.data().slug as string) ?? d.id,
    title: (d.data().title as string) ?? d.id,
    status: (d.data().status ||
      (d.data().published ? "published" : "draft")) as
      | "published"
      | "coming_soon"
      | "draft",
  }));
}

/* ── Overview (dashboard list) ── */

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const trips = await listTrips();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const allReaderUids = new Set<string>();
  const activeThisMonth = new Set<string>();
  let totalPreviewOpens = 0;

  const rows: TripSummaryRow[] = [];

  for (const trip of trips) {
    const aggSnap = await adminDb.collection("analytics").doc(trip.slug).get();
    const agg = aggSnap.data() || {};
    const previewOpens = (agg.previewOpens as number) || 0;
    totalPreviewOpens += previewOpens;

    const viewsSnap = await adminDb
      .collection("analytics")
      .doc(trip.slug)
      .collection("views")
      .get();

    let totalViews = 0;
    for (const v of viewsSnap.docs) {
      const d = v.data();
      totalViews += (d.viewCount as number) || 0;
      allReaderUids.add(v.id);
      const last = d.lastViewedAt as Ts;
      if (last?.toDate && last.toDate() >= monthStart) activeThisMonth.add(v.id);
    }

    rows.push({
      tripSlug: trip.slug,
      tripTitle: trip.title,
      status: trip.status,
      readers: viewsSnap.size,
      totalViews,
      previewOpens,
      lastActivityAt: toISO(agg.lastActivityAt as Ts),
    });
  }

  // Sort by recent activity, then readers.
  rows.sort((a, b) => {
    const at = a.lastActivityAt ? Date.parse(a.lastActivityAt) : 0;
    const bt = b.lastActivityAt ? Date.parse(b.lastActivityAt) : 0;
    return bt - at || b.readers - a.readers;
  });

  return {
    overview: {
      totalTrips: trips.length,
      publishedTrips: trips.filter((t) => t.status === "published").length,
      totalReaders: allReaderUids.size,
      activeThisMonth: activeThisMonth.size,
      totalPreviewOpens,
    },
    trips: rows,
  };
}

/* ── Per-trip detail (full-screen view) ── */

export async function getTripAnalytics(
  slug: string
): Promise<TripAnalyticsDetail | null> {
  const trips = await listTrips();
  const trip = trips.find((t) => t.slug === slug);
  if (!trip) return null;

  const aggSnap = await adminDb.collection("analytics").doc(slug).get();
  const agg = aggSnap.data() || {};

  const viewsSnap = await adminDb
    .collection("analytics")
    .doc(slug)
    .collection("views")
    .get();

  const readers: ReaderRow[] = [];
  const totals = emptyEngagement();
  let totalViews = 0;
  let maxDay = 0;
  const dayCounts = new Map<number, number>();

  for (const v of viewsSnap.docs) {
    const d = v.data();
    const days = (d.daysViewed as number[]) || [];
    const engagement = readEngagement(d.engagement);
    for (const k of Object.keys(totals) as (keyof Engagement)[]) {
      totals[k] += engagement[k];
    }
    totalViews += (d.viewCount as number) || 0;
    for (const day of days) {
      maxDay = Math.max(maxDay, day);
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    }
    readers.push({
      uid: v.id,
      name: (d.name as string) || "Unknown",
      email: (d.email as string) || v.id,
      firstViewedAt: toISO(d.firstViewedAt as Ts),
      lastViewedAt: toISO(d.lastViewedAt as Ts),
      viewCount: (d.viewCount as number) || 0,
      daysReached: days.length,
      engagement,
    });
  }

  readers.sort((a, b) => {
    const at = a.lastViewedAt ? Date.parse(a.lastViewedAt) : 0;
    const bt = b.lastViewedAt ? Date.parse(b.lastViewedAt) : 0;
    return bt - at;
  });

  const dailyOpensMap = (agg.dailyOpens as Record<string, number>) || {};
  const dailyOpens = Object.entries(dailyOpensMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const dayFunnel = Array.from({ length: maxDay }, (_, i) => ({
    day: i + 1,
    readers: dayCounts.get(i + 1) || 0,
  }));

  return {
    tripSlug: slug,
    tripTitle: trip.title,
    status: trip.status,
    previewOpens: (agg.previewOpens as number) || 0,
    readerOpens: (agg.readerOpens as number) || 0,
    totalReaders: viewsSnap.size,
    totalViews,
    lastActivityAt: toISO(agg.lastActivityAt as Ts),
    dailyOpens,
    dayFunnel,
    engagement: totals,
    readers,
  };
}
