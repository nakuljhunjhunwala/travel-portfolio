"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { Trip, Day, Place } from "@/types";
import { useAuth } from "@/lib/auth-context";
import DayTabs from "@/components/trip/DayTabs";
import TripSummary from "@/components/trip/TripSummary";
import InteractiveTripMap from "@/components/map/InteractiveTripMap";
import PlaceCard from "@/components/place/PlaceCard";
import TravelConnector from "@/components/place/TravelConnector";
import LoginGate from "@/components/auth/LoginGate";
import BottomSheet from "@/components/ui/BottomSheet";
import { useScrollTracking } from "@/hooks/useScrollTracking";
import { useActiveDayObserver, scrollToDay } from "@/hooks/useActiveDayObserver";
import { usePlaceCoordinates } from "@/hooks/usePlaceCoordinates";

interface TripDetailContentProps {
  trip: Trip;
  days: Day[];
  dayPlaces: Record<string, Place[]>;
}

/* ── Config ── */

const LOGIN_GATE_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_LOGIN_GATE !== "false";

/* ──────────────────────── Formatters ──────────────────────── */

function formatDateRange(
  start: { seconds: number },
  end: { seconds: number }
): string {
  const s = new Date(start.seconds * 1000);
  const e = new Date(end.seconds * 1000);
  const sMonth = s.toLocaleDateString("en-US", { month: "short" });
  const eMonth = e.toLocaleDateString("en-US", { month: "short" });
  if (sMonth === eMonth) {
    return `${sMonth} ${s.getDate()} – ${e.getDate()}, ${e.getFullYear()}`;
  }
  return `${sMonth} ${s.getDate()} – ${eMonth} ${e.getDate()}, ${e.getFullYear()}`;
}

function formatDayHeading(timestamp: { seconds: number }): string {
  const d = new Date(timestamp.seconds * 1000);
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  const month = d.toLocaleDateString("en-US", { month: "long" });
  const day = d.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
        ? "nd"
        : day === 3 || day === 23
          ? "rd"
          : "th";
  return `${weekday}, ${month} ${day}${suffix}`;
}

function getDayCount(
  start: { seconds: number },
  end: { seconds: number }
): number {
  const ms = (end.seconds - start.seconds) * 1000;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function travelModeIcon(mode: string): string {
  const map: Record<string, string> = {
    car: "🚗", auto: "🛺", bus: "🚌", train: "🚂",
    walk: "🥾", flight: "✈️", bike: "🏍️", ferry: "⛴️",
  };
  return map[mode] ?? "🚗";
}

/* ──────────────────────── Gating Logic ──────────────────────── */

function computeGating(
  days: Day[],
  dayPlaces: Record<string, Place[]>,
  isLoggedIn: boolean,
  gateEnabled: boolean
): {
  visibleDays: Day[];
  gatedDayPlaces: Record<string, Place[]>;
  isGated: boolean;
} {
  if (!gateEnabled || isLoggedIn || days.length === 0) {
    return {
      visibleDays: days,
      gatedDayPlaces: dayPlaces,
      isGated: false,
    };
  }

  const totalPlaces = days.reduce(
    (sum, day) => sum + (dayPlaces[day.id]?.length ?? 0),
    0
  );

  const day1 = days[0];
  const day1Places = dayPlaces[day1.id] ?? [];

  const tenPercent = Math.max(1, Math.ceil(totalPlaces * 0.1));
  const halfDay = Math.max(1, Math.ceil(day1Places.length / 2));
  const freePlaces = Math.min(tenPercent, halfDay);

  return {
    visibleDays: [day1],
    gatedDayPlaces: { [day1.id]: day1Places.slice(0, freePlaces) },
    isGated: true,
  };
}

/* ──────────────────────── Stat Card ──────────────────────── */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 bg-card rounded-xl border border-border/60 p-3.5 md:p-4">
      <span className="w-9 h-9 rounded-lg bg-primary-soft flex items-center justify-center flex-shrink-0 text-primary-text">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-heading font-semibold text-heading text-sm md:text-base truncate">{value}</p>
        <p className="text-[10px] md:text-xs text-muted">{label}</p>
      </div>
    </div>
  );
}

/* ──────────────────────── Transit Arrival Card ──────────────────────── */

function TransitArrivalCard({
  fromCity,
  toCity,
}: {
  fromCity: string;
  toCity: string;
}) {
  return (
    <div className="flex items-center justify-between bg-card rounded-xl border border-border/60 px-4 py-3.5 md:px-5 md:py-4 mb-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="3" width="16" height="14" rx="2" />
            <path d="M4 10h16" />
            <path d="M9 21l-2-4" />
            <path d="M15 21l2-4" />
            <circle cx="9" cy="14" r="1" fill="#059669" />
            <circle cx="15" cy="14" r="1" fill="#059669" />
          </svg>
        </span>
        <div>
          <p className="font-heading font-semibold text-heading text-sm md:text-base">
            {fromCity} — {toCity}
          </p>
          <p className="text-[10px] md:text-xs text-muted">City transit</p>
        </div>
      </div>
      <span className="font-mono text-xs text-emerald-600 bg-emerald-50 rounded-md px-2 py-0.5 whitespace-nowrap">
        Arrives
      </span>
    </div>
  );
}

/* ──────────────────────── Day Accordion Section ──────────────────────── */

function DaySection({
  day,
  dayIndex,
  prevDay,
  places,
  placeCount,
  isPartial,
}: {
  day: Day;
  dayIndex: number;
  prevDay: Day | null;
  places: Place[];
  placeCount: number;
  isPartial: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const isNewCity = prevDay && prevDay.city !== day.city;

  return (
    <section
      id={`day-${day.dayNumber}`}
      data-day-number={day.dayNumber}
    >
      {/* Separator */}
      {dayIndex > 0 && (
        <hr className="border-border/60 my-6 md:my-8" />
      )}

      {/* Day header — accordion toggle */}
      <button
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full flex items-start gap-2.5 text-left cursor-pointer group py-1"
      >
        {/* Chevron */}
        <motion.svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted mt-1.5 flex-shrink-0"
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path d="M9 18l6-6-6-6" />
        </motion.svg>

        <div className="flex-1 min-w-0">
          <h2 className="font-heading text-lg md:text-xl font-bold text-heading leading-tight">
            {formatDayHeading(day.date)}
          </h2>
          <p className="font-body text-xs md:text-sm text-muted mt-0.5">
            {day.dayTitle}
            {placeCount > 0 && (
              <span className="text-muted/60"> · {placeCount} places</span>
            )}
          </p>
        </div>

        {/* Stats — right side */}
        <span className="font-mono text-[11px] md:text-xs text-muted whitespace-nowrap mt-2 bg-[var(--color-travel-row)] rounded-md px-2 py-0.5 shrink-0 max-w-[40%] truncate">
          {day.totalDuration} · {day.totalDistance}
        </span>
      </button>

      {/* Accordion content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-4 md:pt-5">
              {/* Transit arrival card when city changes */}
              {isNewCity && prevDay && (
                <TransitArrivalCard
                  fromCity={prevDay.city}
                  toCity={day.city}
                />
              )}

              {/* Places + connectors */}
              {places.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {places.map((place, i) => (
                    <div key={place.id} data-place-id={place.googlePlaceId}>
                      <PlaceCard
                        place={place}
                        placeCity={day.city}
                      />
                      {place.travelToNext && i < places.length - 1 && (
                        <TravelConnector connector={place.travelToNext} />
                      )}
                    </div>
                  ))}

                  {/* Partial day indicator */}
                  {isPartial && (
                    <div className="text-center py-3 text-muted text-xs font-body">
                      <span className="opacity-60">+ more places hidden</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[var(--color-travel-row)] rounded-xl p-6 text-center">
                  <p className="text-muted text-sm">
                    Places for this day coming soon.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ──────────────────────── Share Button ──────────────────────── */

function ShareFAB({ trip }: { trip: Trip }) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const shareUrl = typeof window !== "undefined"
    ? window.location.href
    : `${process.env.NEXT_PUBLIC_BASE_URL || ""}/trips/${trip.slug}`;
  const shareTitle = trip.title;
  const shareText = `${trip.hookLine} — Check out this trip!`;

  // Close menu on outside click
  useEffect(() => {
    if (!showMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [showMenu]);

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        return;
      } catch {
        // User cancelled — fall through to menu
      }
    }
    setShowMenu((prev) => !prev);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => { setCopied(false); setShowMenu(false); }, 1200);
    } catch {
      setShowMenu(false);
    }
  };

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setShowMenu(false);
  };

  const shareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setShowMenu(false);
  };

  return (
    <div className="fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] left-5 z-30" ref={menuRef}>
      {/* Dropdown menu — opens upward */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 mb-2 bg-card rounded-xl shadow-lg border border-border/60 overflow-hidden min-w-[180px]"
          >
            <button
              onClick={shareWhatsApp}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-heading hover:bg-primary-soft/30 transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </button>
            <button
              onClick={shareTwitter}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-heading hover:bg-primary-soft/30 transition-colors cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Twitter / X
            </button>
            <button
              onClick={copyLink}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-body text-heading hover:bg-primary-soft/30 transition-colors cursor-pointer border-t border-border/40"
            >
              {copied ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                  Copy link
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <button
        onClick={handleShare}
        className="w-12 h-12 rounded-full bg-card text-heading shadow-lg flex items-center justify-center hover:shadow-xl active:scale-95 transition-all cursor-pointer border border-border/60"
        aria-label="Share this trip"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>
    </div>
  );
}

/* ──────────────────────── Main Content ──────────────────────── */

export default function TripDetailContent({
  trip,
  days,
  dayPlaces,
}: TripDetailContentProps) {
  const { user, loading } = useAuth();
  const isLoggedIn = !!user;
  const dayCount = getDayCount(trip.startDate, trip.endDate);

  useScrollTracking(trip.slug, user?.uid ?? null);

  const gating = useMemo(
    () => computeGating(days, dayPlaces, isLoggedIn, LOGIN_GATE_ENABLED),
    [days, dayPlaces, isLoggedIn]
  );

  const tabDays = gating.isGated ? gating.visibleDays : days;
  const activeDayPlaces = gating.isGated ? gating.gatedDayPlaces : dayPlaces;

  // Active day — lifted state with scroll-sync
  const { activeDay: observedDay, suppress } = useActiveDayObserver(tabDays.length);
  const [activeDay, setActiveDay] = useState(1);

  // Sync observer → activeDay
  useEffect(() => {
    setActiveDay(observedDay);
  }, [observedDay]);

  const handleDayChange = useCallback((dayNumber: number) => {
    suppress(); // Pause observer during programmatic scroll
    setActiveDay(dayNumber);
  }, [suppress]);

  // Coordinates for interactive map
  const { coordinates } = usePlaceCoordinates(
    gating.isGated ? gating.visibleDays : days,
    activeDayPlaces
  );

  const hasCoordinates = Object.keys(coordinates).length > 0;

  // Mobile map bottom sheet
  const [showMobileMap, setShowMobileMap] = useState(false);

  // Handle marker click — scroll to place
  const handleMarkerClick = useCallback((placeId: string, dayNumber: number) => {
    suppress();
    setActiveDay(dayNumber);
    setShowMobileMap(false);

    // Find and scroll to the place card
    setTimeout(() => {
      const placeEl = document.querySelector(`[data-place-id="${placeId}"]`);
      if (placeEl) {
        placeEl.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        scrollToDay(dayNumber);
      }
    }, 100);
  }, [suppress]);

  // Deep link: scroll to #day-N on page load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#day-")) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
      }
    }
  }, []);

  return (
    <article
      data-trip-theme={trip.tripTheme}
      className="min-h-screen bg-bg"
    >
      {/* ── Hero ── */}
      <div className="relative w-full h-[34vh] md:h-[40vh] overflow-hidden">
        <Image
          src={trip.coverPhoto}
          alt={`${trip.title} — ${trip.states.join(", ")}`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
          {...(trip.blurHash
            ? { placeholder: "blur" as const, blurDataURL: trip.blurHash }
            : {})}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Back button */}
        <Link
          href="/"
          className="absolute top-3 left-3 md:top-5 md:left-5 z-10 flex items-center gap-1.5 bg-white/15 backdrop-blur-xl text-white text-xs md:text-sm px-3.5 py-2.5 md:px-4 md:py-2.5 min-h-[44px] rounded-full hover:bg-white/25 transition-all border border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline font-medium">Home</span>
        </Link>

      </div>

      {/* ── Floating Title Card ── */}
      <div className="relative -mt-20 md:-mt-24 px-4 md:px-8 max-w-4xl mx-auto lg:max-w-5xl z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative bg-card rounded-2xl overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.03),0_8px_24px_rgba(0,0,0,0.08),0_20px_48px_rgba(0,0,0,0.04)]"
        >
          {/* Accent bar — trip theme color */}
          <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary/40" />

          <div className="p-5 md:p-7">
            <h1 className="font-heading text-2xl sm:text-2xl md:text-3xl font-bold text-heading leading-tight">
              {trip.title}
            </h1>

            <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 mt-3">
              {/* Date */}
              <div className="flex items-center gap-1.5 text-muted">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="font-body text-sm">{formatDateRange(trip.startDate, trip.endDate)}</span>
              </div>

              <span className="w-px h-3.5 bg-border hidden sm:block" />

              {/* Location */}
              <div className="flex items-center gap-1.5 text-muted">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span className="font-body text-sm">{trip.states.join(", ")}</span>
              </div>
            </div>

            {/* Tags inside card */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              {trip.tags.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="bg-primary-soft text-primary-text rounded-full px-2.5 py-0.5 text-[11px] md:text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Hook Line ── */}
      <div className="px-4 md:px-8 max-w-4xl mx-auto lg:max-w-5xl mt-6 md:mt-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center py-2"
        >
          <p className="font-body text-base md:text-lg text-body/70 italic leading-relaxed">
            &ldquo;{trip.hookLine}&rdquo;
          </p>
        </motion.div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="px-4 md:px-8 max-w-4xl mx-auto lg:max-w-5xl mt-4 md:mt-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
          <StatCard
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
              </svg>
            }
            label="Duration"
            value={`${dayCount} days`}
          />
          <StatCard
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            }
            label="Cities"
            value={`${trip.cities.length} cities`}
          />
          <StatCard
            icon={<span className="text-base leading-none">{travelModeIcon(trip.travelMode[0])}</span>}
            label="Travel"
            value={trip.travelMode.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(", ")}
          />
          <StatCard
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            }
            label={`${trip.budgetTier} budget`}
            value={`₹${trip.totalCost.toLocaleString("en-IN")}`}
          />
        </div>
      </div>

      {/* ── Trip Summary / DNA Card ── */}
      <div className="px-4 md:px-8 max-w-4xl mx-auto lg:max-w-5xl mt-5 md:mt-6">
        <TripSummary trip={trip} />
      </div>

      {/* ── Day Tabs + Split Panel (Desktop: itinerary left, map right) ── */}
      {days.length > 0 && (
        <div className="mt-6 md:mt-8">
          {/* Day Tabs — full width sticky */}
          <DayTabs
            days={tabDays}
            activeDay={activeDay}
            onDayChange={handleDayChange}
          />

          {/* Split panel: itinerary + map */}
          <div className="lg:flex lg:max-w-[1400px] lg:mx-auto">
            {/* Left: Itinerary */}
            <div className="px-4 md:px-8 lg:px-6 lg:w-[55%] lg:min-w-0 pt-4 pb-16">
              <AnimatePresence mode="wait">
                {gating.isGated ? (
                  <motion.div
                    key="gated-view"
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    {gating.visibleDays.map((day, dayIndex) => {
                      const places = gating.gatedDayPlaces[day.id] ?? [];
                      const prevDay = dayIndex > 0 ? gating.visibleDays[dayIndex - 1] : null;

                      return (
                        <DaySection
                          key={day.id}
                          day={day}
                          dayIndex={dayIndex}
                          prevDay={prevDay}
                          places={places}
                          placeCount={places.length}
                          isPartial={true}
                        />
                      );
                    })}

                    {!loading && (
                      <LoginGate
                        tripId={trip.id}
                        readerCount={0}
                      />
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="full-view"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
                  >
                    {days.map((day, dayIndex) => {
                      const places = dayPlaces[day.id] ?? [];
                      const prevDay = dayIndex > 0 ? days[dayIndex - 1] : null;

                      return (
                        <DaySection
                          key={day.id}
                          day={day}
                          dayIndex={dayIndex}
                          prevDay={prevDay}
                          places={places}
                          placeCount={places.length}
                          isPartial={false}
                        />
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Sticky Map (desktop only) */}
            {hasCoordinates && (
              <div className="hidden lg:block lg:w-[45%] lg:flex-shrink-0">
                <div className="sticky top-[60px] h-[calc(100vh-60px)] p-3 pt-4">
                  <InteractiveTripMap
                    days={gating.isGated ? gating.visibleDays : days}
                    dayPlaces={activeDayPlaces}
                    activeDay={activeDay}
                    coordinates={coordinates}
                    tripTheme={trip.tripTheme}
                    onMarkerClick={handleMarkerClick}
                    className="h-full"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile Map FAB ── */}
      {hasCoordinates && (
        <button
          onClick={() => setShowMobileMap(true)}
          className="lg:hidden fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom))] right-5 z-30 w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:shadow-xl active:scale-95 transition-all cursor-pointer"
          aria-label="Show map"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
        </button>
      )}

      {/* ── Mobile Map Bottom Sheet ── */}
      {hasCoordinates && (
        <BottomSheet
          isOpen={showMobileMap}
          onClose={() => setShowMobileMap(false)}
          title="Trip Map"
        >
          <div className="h-[55dvh] -mx-4">
            <InteractiveTripMap
              days={gating.isGated ? gating.visibleDays : days}
              dayPlaces={activeDayPlaces}
              activeDay={activeDay}
              coordinates={coordinates}
              tripTheme={trip.tripTheme}
              onMarkerClick={handleMarkerClick}
              className="h-full"
            />
          </div>
        </BottomSheet>
      )}

      {/* ── Share FAB ── */}
      <ShareFAB trip={trip} />
    </article>
  );
}
