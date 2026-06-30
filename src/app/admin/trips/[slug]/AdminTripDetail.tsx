"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type { TripAnalyticsDetail, Engagement } from "@/lib/admin";

const ENG: { key: keyof Engagement; label: string }[] = [
  { key: "essentials", label: "Opened Trip Essentials" },
  { key: "map", label: "Used the map" },
  { key: "contact", label: "Tapped a contact / link" },
  { key: "share", label: "Shared the trip" },
  { key: "copy", label: "Copied the itinerary" },
];

function fmtDate(iso: string | null): string {
  if (!iso) return "--";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
function fmtDateTime(iso: string | null): string {
  if (!iso) return "--";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminTripDetail({ slug }: { slug: string }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<TripAnalyticsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
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
        body: JSON.stringify({ slug }),
      });
      if (res.status === 403) return router.replace("/");
      if (res.status === 404) throw new Error("Trip not found");
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      setData((await res.json()) as TripAnalyticsDetail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [user, router, slug]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) return void router.replace("/");
    load();
  }, [user, authLoading, router, load]);

  if (authLoading || !user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-bg">
        <p className="text-muted font-body">{error ?? "No data"}</p>
        <Link href="/admin" className="text-primary text-sm font-body hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const maxDaily = Math.max(1, ...data.dailyOpens.map((d) => d.count));
  const engReaders = Object.fromEntries(
    ENG.map((e) => [e.key, data.readers.filter((r) => r.engagement[e.key] > 0).length])
  ) as Record<keyof Engagement, number>;

  const stats = [
    { label: "Readers", value: data.totalReaders },
    { label: "Reader views", value: data.totalViews },
    { label: "Preview opens", value: data.previewOpens },
    { label: "Last activity", value: fmtDate(data.lastActivityAt), small: true },
  ];

  return (
    <div className="min-h-screen bg-bg px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Link href="/admin" className="text-muted text-sm font-body hover:text-primary inline-flex items-center gap-1">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-heading font-heading mt-2">{data.tripTitle}</h1>
          <p className="text-muted text-sm font-body mt-0.5">Trip analytics · {data.tripSlug}</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-5 shadow-card">
              <p className="text-muted text-xs font-body uppercase tracking-wide">{s.label}</p>
              <p className={`font-bold text-heading font-mono mt-1 ${s.small ? "text-lg" : "text-3xl"}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Views over time */}
        <Card title="Views over time">
          {data.dailyOpens.length === 0 ? (
            <Empty />
          ) : (
            <div className="flex items-end gap-1.5 h-40">
              {data.dailyOpens.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center justify-end gap-1 group">
                  <span className="text-[10px] font-mono text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.count}
                  </span>
                  <div
                    className="w-full rounded-t bg-primary/80 min-h-[2px]"
                    style={{ height: `${(d.count / maxDaily) * 100}%` }}
                    title={`${d.date}: ${d.count}`}
                  />
                  <span className="text-[9px] font-mono text-muted rotate-0 truncate w-full text-center">
                    {d.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Day-reach funnel */}
        <Card title="How far readers got">
          {data.dayFunnel.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-2">
              {data.dayFunnel.map((d) => (
                <div key={d.day} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted w-12 flex-shrink-0">Day {d.day}</span>
                  <div className="flex-1 h-5 rounded bg-[var(--color-travel-row)] overflow-hidden">
                    <div
                      className="h-full rounded bg-gradient-to-r from-primary to-primary-text flex items-center justify-end px-2"
                      style={{ width: `${data.totalReaders ? (d.readers / data.totalReaders) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-heading w-8 text-right">{d.readers}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Engagement */}
        <Card title="Engagement">
          <div className="space-y-2.5">
            {ENG.map((e) => {
              const readersDid = engReaders[e.key];
              const total = data.engagement[e.key];
              const pct = data.totalReaders ? (readersDid / data.totalReaders) * 100 : 0;
              return (
                <div key={e.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-body text-body">{e.label}</span>
                    <span className="text-[11px] font-mono text-muted">
                      {readersDid}/{data.totalReaders} readers · {total}×
                    </span>
                  </div>
                  <div className="h-[6px] rounded-full bg-[var(--color-travel-row)] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary-text"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Readers */}
        <Card title={`Readers · ${data.readers.length}`}>
          {data.readers.length === 0 ? (
            <Empty label="No signed-in readers yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted border-b border-border">
                    <th className="text-left py-2 px-2 font-medium font-body text-xs uppercase tracking-wide">Reader</th>
                    <th className="text-right py-2 px-2 font-medium font-body text-xs uppercase tracking-wide">Views</th>
                    <th className="text-right py-2 px-2 font-medium font-body text-xs uppercase tracking-wide">Days</th>
                    <th className="text-left py-2 px-2 font-medium font-body text-xs uppercase tracking-wide">Engaged</th>
                    <th className="text-right py-2 px-2 font-medium font-body text-xs uppercase tracking-wide">First</th>
                    <th className="text-right py-2 px-2 font-medium font-body text-xs uppercase tracking-wide">Last</th>
                  </tr>
                </thead>
                <tbody>
                  {data.readers.map((r) => (
                    <tr key={r.uid} className="border-b border-border/50 last:border-b-0">
                      <td className="py-2.5 px-2">
                        <p className="text-heading font-body font-medium leading-tight">{r.name}</p>
                        <p className="text-muted font-mono text-[11px]">{r.email}</p>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-heading">{r.viewCount}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-heading">{r.daysReached}</td>
                      <td className="py-2.5 px-2">
                        <div className="flex gap-1 flex-wrap">
                          {ENG.filter((e) => r.engagement[e.key] > 0).map((e) => (
                            <span key={e.key} className="text-[10px] px-1.5 py-0.5 rounded bg-primary-soft text-primary-text font-mono">
                              {e.key}
                            </span>
                          ))}
                          {ENG.every((e) => r.engagement[e.key] === 0) && (
                            <span className="text-[11px] text-muted">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono text-muted text-xs">{fmtDateTime(r.firstViewedAt)}</td>
                      <td className="py-2.5 px-2 text-right font-mono text-muted text-xs">{fmtDateTime(r.lastViewedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-card p-5">
      <h2 className="text-base font-semibold text-heading font-heading mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Empty({ label = "No data yet" }: { label?: string }) {
  return <p className="text-muted text-sm font-body py-4 text-center">{label}</p>;
}
