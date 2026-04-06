"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type {
  OverviewStats,
  TripAnalyticsRow,
  PlacesCacheStats,
  AdminAnalytics,
} from "@/lib/admin";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTrips, setExpandedTrips] = useState<Set<string>>(new Set());

  const fetchAnalytics = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const idToken = await user.getIdToken();
      const res = await fetch("/api/admin/analytics", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 403) {
        router.replace("/");
        return;
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch analytics (${res.status})`);
      }

      const analytics: AdminAnalytics = await res.json();
      setData(analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [user, router]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/");
      return;
    }
    fetchAnalytics();
  }, [user, authLoading, router, fetchAnalytics]);

  // Auth loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-muted font-body">Checking authentication...</p>
      </div>
    );
  }

  // Not logged in — redirecting
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-muted font-body">Redirecting...</p>
      </div>
    );
  }

  // Data loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted font-body">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center space-y-4">
          <p className="text-heading font-heading text-lg">Something went wrong</p>
          <p className="text-muted font-body text-sm">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-5 py-2.5 min-h-[44px] bg-primary text-white rounded-lg text-sm font-body hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const toggleTrip = (slug: string) => {
    setExpandedTrips((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-bg px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-heading font-heading">
              Admin Dashboard
            </h1>
            <p className="text-muted text-sm font-body mt-1">
              Analytics overview for your travel portfolio
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2.5 min-h-[44px] bg-card border border-border rounded-lg text-sm text-body font-body hover:bg-primary-soft transition-colors"
          >
            Refresh
          </button>
        </div>

        {/* Overview Stats */}
        <OverviewStatsRow stats={data.overview} />

        {/* Trip Analytics Table */}
        <TripAnalyticsTable
          trips={data.tripAnalytics}
          expandedTrips={expandedTrips}
          onToggle={toggleTrip}
        />

        {/* Places Cache */}
        <PlacesCacheCard cache={data.placesCache} />
      </div>
    </div>
  );
}

/* ── Overview Stats Row ── */

function OverviewStatsRow({ stats }: { stats: OverviewStats }) {
  const items = [
    { label: "Total Trips", value: stats.totalTrips },
    { label: "Published", value: stats.publishedTrips },
    { label: "Total Readers", value: stats.totalReaders },
    { label: "Views This Month", value: stats.viewsThisMonth },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-card border border-border rounded-xl p-5 shadow-card"
        >
          <p className="text-muted text-xs font-body uppercase tracking-wide">
            {item.label}
          </p>
          <p className="text-3xl font-bold text-heading font-mono mt-1">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ── Trip Analytics Table ── */

function TripAnalyticsTable({
  trips,
  expandedTrips,
  onToggle,
}: {
  trips: TripAnalyticsRow[];
  expandedTrips: Set<string>;
  onToggle: (slug: string) => void;
}) {
  if (trips.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 shadow-card text-center">
        <p className="text-muted font-body">No trip analytics data yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-heading font-heading">
          Trip Analytics
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg">
              <th className="text-left px-5 py-3 font-medium text-muted font-body text-xs uppercase tracking-wide">
                Trip
              </th>
              <th className="text-right px-5 py-3 font-medium text-muted font-body text-xs uppercase tracking-wide">
                Views
              </th>
              <th className="text-right px-5 py-3 font-medium text-muted font-body text-xs uppercase tracking-wide">
                Unique
              </th>
              <th className="text-right px-5 py-3 font-medium text-muted font-body text-xs uppercase tracking-wide">
                Avg Days
              </th>
              <th className="text-right px-5 py-3 font-medium text-muted font-body text-xs uppercase tracking-wide">
                Last View
              </th>
              <th className="px-5 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {trips.map((trip, idx) => (
              <TripRow
                key={trip.tripSlug}
                trip={trip}
                isEven={idx % 2 === 0}
                isExpanded={expandedTrips.has(trip.tripSlug)}
                onToggle={() => onToggle(trip.tripSlug)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TripRow({
  trip,
  isEven,
  isExpanded,
  onToggle,
}: {
  trip: TripAnalyticsRow;
  isEven: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      <tr
        className={`border-b border-border last:border-b-0 cursor-pointer hover:bg-primary-soft/50 transition-colors ${
          isEven ? "bg-card" : "bg-bg/50"
        }`}
        onClick={onToggle}
      >
        <td className="px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="text-heading font-body font-medium">
              {trip.tripTitle}
            </span>
            {trip.status !== "published" && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${
                trip.status === "coming_soon"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-muted/20 text-muted"
              }`}>
                {trip.status === "coming_soon" ? "Coming Soon" : "Draft"}
              </span>
            )}
          </div>
        </td>
        <td className="px-5 py-3 text-right font-mono text-heading">
          {trip.totalViews}
        </td>
        <td className="px-5 py-3 text-right font-mono text-heading">
          {trip.uniqueReaders}
        </td>
        <td className="px-5 py-3 text-right font-mono text-heading">
          {trip.avgDaysRead}
        </td>
        <td className="px-5 py-3 text-right font-mono text-muted text-xs">
          {trip.lastViewAt ? formatDate(trip.lastViewAt) : "--"}
        </td>
        <td className="px-5 py-3 text-center">
          <span
            className={`inline-block transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          >
            <ChevronRight />
          </span>
        </td>
      </tr>
      {isExpanded && trip.readers.length > 0 && (
        <tr>
          <td colSpan={6} className="bg-bg px-5 py-3">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted">
                    <th className="text-left py-2 px-3 font-medium font-body uppercase tracking-wide">
                      Reader
                    </th>
                    <th className="text-left py-2 px-3 font-medium font-body uppercase tracking-wide">
                      Email
                    </th>
                    <th className="text-right py-2 px-3 font-medium font-body uppercase tracking-wide">
                      Views
                    </th>
                    <th className="text-right py-2 px-3 font-medium font-body uppercase tracking-wide">
                      Days
                    </th>
                    <th className="text-right py-2 px-3 font-medium font-body uppercase tracking-wide">
                      First Read
                    </th>
                    <th className="text-right py-2 px-3 font-medium font-body uppercase tracking-wide">
                      Last Visit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {trip.readers.map((reader) => (
                    <tr
                      key={reader.uid}
                      className="border-t border-border/50"
                    >
                      <td className="py-2 px-3 text-heading font-body">
                        {reader.name}
                      </td>
                      <td className="py-2 px-3 text-muted font-mono">
                        {reader.email}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-heading">
                        {reader.viewCount}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-heading">
                        {reader.daysUnlocked}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-muted">
                        {reader.firstRead ? formatDate(reader.firstRead) : "--"}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-muted">
                        {reader.lastVisit ? formatDate(reader.lastVisit) : "--"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
      {isExpanded && trip.readers.length === 0 && (
        <tr>
          <td colSpan={6} className="bg-bg px-5 py-4 text-center">
            <p className="text-muted text-xs font-body">No readers yet</p>
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Places Cache Card ── */

function PlacesCacheCard({ cache }: { cache: PlacesCacheStats }) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-card p-5">
      <h2 className="text-lg font-semibold text-heading font-heading mb-4">
        Places Cache
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-muted text-xs font-body uppercase tracking-wide">
            Total Cached
          </p>
          <p className="text-2xl font-bold text-heading font-mono mt-1">
            {cache.totalCached}
          </p>
        </div>
        <div>
          <p className="text-muted text-xs font-body uppercase tracking-wide">
            With Summary
          </p>
          <p className="text-2xl font-bold text-heading font-mono mt-1">
            {cache.withSummary}
          </p>
        </div>
        <div>
          <p className="text-muted text-xs font-body uppercase tracking-wide">
            Last Cached
          </p>
          <p className="text-sm text-heading font-mono mt-2">
            {cache.lastCachedAt ? formatDateTime(cache.lastCachedAt) : "--"}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ChevronRight() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="text-muted"
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
