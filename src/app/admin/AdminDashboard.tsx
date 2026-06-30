"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type { OverviewStats, TripSummaryRow, AdminAnalytics } from "@/lib/admin";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        body: "{}",
      });
      if (res.status === 403) {
        router.replace("/");
        return;
      }
      if (!res.ok) throw new Error(`Failed to fetch analytics (${res.status})`);
      setData((await res.json()) as AdminAnalytics);
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

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <p className="text-muted font-body">Checking authentication…</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted font-body">Loading analytics…</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-bg px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-heading font-heading">Admin Dashboard</h1>
            <p className="text-muted text-sm font-body mt-1">
              Reader analytics across your travel portfolio
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2.5 min-h-[44px] bg-card border border-border rounded-lg text-sm text-body font-body hover:bg-primary-soft transition-colors"
          >
            Refresh
          </button>
        </div>

        <OverviewRow stats={data.overview} />
        <TripsTable trips={data.trips} />
      </div>
    </div>
  );
}

function OverviewRow({ stats }: { stats: OverviewStats }) {
  const items = [
    { label: "Total Trips", value: stats.totalTrips },
    { label: "Published", value: stats.publishedTrips },
    { label: "Readers", value: stats.totalReaders },
    { label: "Active This Month", value: stats.activeThisMonth },
    { label: "Preview Opens", value: stats.totalPreviewOpens },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <div key={item.label} className="bg-card border border-border rounded-xl p-5 shadow-card">
          <p className="text-muted text-xs font-body uppercase tracking-wide">{item.label}</p>
          <p className="text-3xl font-bold text-heading font-mono mt-1">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function TripsTable({ trips }: { trips: TripSummaryRow[] }) {
  if (trips.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 shadow-card text-center">
        <p className="text-muted font-body">No trips yet.</p>
      </div>
    );
  }
  return (
    <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-heading font-heading">Trips</h2>
        <p className="text-muted text-xs font-body mt-0.5">Tap a trip for full analytics</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-bg text-muted">
              <th className="text-left px-5 py-3 font-medium font-body text-xs uppercase tracking-wide">Trip</th>
              <th className="text-right px-5 py-3 font-medium font-body text-xs uppercase tracking-wide">Readers</th>
              <th className="text-right px-5 py-3 font-medium font-body text-xs uppercase tracking-wide">Views</th>
              <th className="text-right px-5 py-3 font-medium font-body text-xs uppercase tracking-wide">Previews</th>
              <th className="text-right px-5 py-3 font-medium font-body text-xs uppercase tracking-wide">Last Activity</th>
              <th className="px-5 py-3 w-10" />
            </tr>
          </thead>
          <tbody>
            {trips.map((trip, idx) => (
              <tr
                key={trip.tripSlug}
                className={`border-b border-border last:border-b-0 hover:bg-primary-soft/40 transition-colors ${idx % 2 === 0 ? "bg-card" : "bg-bg/50"}`}
              >
                <td className="px-5 py-3">
                  <Link href={`/admin/trips/${trip.tripSlug}`} className="flex items-center gap-2 group">
                    <span className="text-heading font-body font-medium group-hover:text-primary transition-colors">
                      {trip.tripTitle}
                    </span>
                    {trip.status !== "published" && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase ${trip.status === "coming_soon" ? "bg-amber-100 text-amber-700" : "bg-muted/20 text-muted"}`}>
                        {trip.status === "coming_soon" ? "Coming Soon" : "Draft"}
                      </span>
                    )}
                  </Link>
                </td>
                <td className="px-5 py-3 text-right font-mono text-heading">{trip.readers}</td>
                <td className="px-5 py-3 text-right font-mono text-heading">{trip.totalViews}</td>
                <td className="px-5 py-3 text-right font-mono text-muted">{trip.previewOpens}</td>
                <td className="px-5 py-3 text-right font-mono text-muted text-xs">
                  {trip.lastActivityAt ? formatDate(trip.lastActivityAt) : "--"}
                </td>
                <td className="px-5 py-3 text-center">
                  <Link href={`/admin/trips/${trip.tripSlug}`} className="text-muted hover:text-primary">
                    <ChevronRight />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="inline-block">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
