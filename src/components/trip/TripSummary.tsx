import type { Trip } from "@/types";

interface TripSummaryProps {
  trip: Trip;
}

/* ── SVG Icons (clean monochrome strokes, Wanderlog-style) ── */

function TreeIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3l-7 10h4l-3 8h12l-3-8h4z" />
    </svg>
  );
}

function UtensilsIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </svg>
  );
}

function LandmarkIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function CalendarCheckIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M9 16l2 2 4-4" />
    </svg>
  );
}

/* ── DNA Bar ── */

function DNABar({
  label,
  icon,
  percent,
  color,
}: {
  label: string;
  icon: React.ReactNode;
  percent: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs md:text-sm font-heading font-medium text-heading">{label}</span>
          <span className="font-mono text-[11px] text-muted">{percent}%</span>
        </div>
        <div className="h-[5px] rounded-full bg-[var(--color-travel-row)] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${percent}%`,
              background: `linear-gradient(90deg, var(--color-primary), var(--color-primary-text))`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Budget Card ── */

function BudgetSection({ trip, perDay }: { trip: Trip; perDay: number }) {
  return (
    <div className="bg-[var(--color-travel-row)] rounded-xl p-4 md:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] md:text-xs font-body text-muted uppercase tracking-wider">Total Budget</p>
          <p className="font-mono text-2xl md:text-3xl font-bold text-heading mt-1">
            ₹{trip.totalCost.toLocaleString("en-IN")}
          </p>
        </div>
        <span className="font-mono text-xs md:text-sm text-primary bg-primary-soft rounded-lg px-2.5 py-1 font-medium">
          {trip.budgetTier}
        </span>
      </div>

      {/* Per-day + per-city breakdown */}
      <div className="flex items-center gap-4 flex-wrap mt-3 pt-3 border-t border-black/[0.06]">
        <div className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
          <span className="font-mono text-xs md:text-sm text-body">
            ~₹{perDay.toLocaleString("en-IN")}<span className="text-muted">/day</span>
          </span>
        </div>
        <span className="w-px h-3 bg-border" />
        <div className="flex items-center gap-1.5">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" /><circle cx="12" cy="10" r="3" />
          </svg>
          <span className="font-mono text-xs md:text-sm text-body">
            {trip.cities.length} cities
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */

function getDayCount(start: { seconds: number }, end: { seconds: number }): number {
  const ms = (end.seconds - start.seconds) * 1000;
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export default function TripSummary({ trip }: TripSummaryProps) {
  const dayCount = getDayCount(trip.startDate, trip.endDate);
  const perDay = Math.round(trip.totalCost / dayCount);

  return (
    <div className="bg-card rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06),0_6px_16px_rgba(0,0,0,0.06)] overflow-hidden">
      {/* Header */}
      <div className="px-5 md:px-6 pt-5 md:pt-6 pb-0">
        <h3 className="font-heading font-bold text-heading text-base md:text-lg">
          Trip at a Glance
        </h3>
      </div>

      {/* Trip DNA */}
      <div className="px-5 md:px-6 pt-4 pb-5 space-y-3">
        <DNABar
          label="Nature"
          icon={<TreeIcon className="text-emerald-600" />}
          percent={trip.tripDNA.nature}
          color="bg-emerald-50"
        />
        <DNABar
          label="Food"
          icon={<UtensilsIcon className="text-amber-600" />}
          percent={trip.tripDNA.food}
          color="bg-amber-50"
        />
        <DNABar
          label="Culture"
          icon={<LandmarkIcon className="text-violet-600" />}
          percent={trip.tripDNA.culture}
          color="bg-violet-50"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Budget */}
      <div className="p-5 md:p-6">
        <BudgetSection trip={trip} perDay={perDay} />
      </div>

      {/* Divider */}
      <div className="border-t border-border/60" />

      {/* Highlights */}
      <div className="px-5 md:px-6 py-5 space-y-4">
        <div className="flex gap-3">
          <span className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <StarIcon className="text-amber-600" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] md:text-xs font-heading font-semibold text-muted uppercase tracking-wider">Best moment</p>
            <p className="text-sm md:text-base text-body leading-relaxed mt-0.5">{trip.bestMoment}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertIcon className="text-red-500" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] md:text-xs font-heading font-semibold text-muted uppercase tracking-wider">Skip this</p>
            <p className="text-sm md:text-base text-body leading-relaxed mt-0.5">{trip.skipThis}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CalendarCheckIcon className="text-blue-600" />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] md:text-xs font-heading font-semibold text-muted uppercase tracking-wider">Best time to visit</p>
            <p className="text-sm md:text-base text-body leading-relaxed mt-0.5">{trip.bestMonth}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
