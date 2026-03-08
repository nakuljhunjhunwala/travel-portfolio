"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Trip } from "@/types";
import { getStaticMapUrl } from "@/lib/mapbox";

/* ── Per-trip theme → line color (hex without #) ── */
const THEME_COLORS: Record<string, string> = {
  rajasthan: "D97706",
  kerala: "059669",
  ladakh: "7C3AED",
  himachal: "0891B2",
  default: "2B6CE6",
};

interface TripCardProps {
  trip: Trip;
  isCompact?: boolean;
}

function formatDate(timestamp: { seconds: number }): string {
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function getDayCount(
  start: { seconds: number },
  end: { seconds: number }
): number {
  const ms = (end.seconds - start.seconds) * 1000;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export default function TripCard({ trip, isCompact = false }: TripCardProps) {
  const [mapError, setMapError] = useState(false);
  const [coverError, setCoverError] = useState(false);
  const days = getDayCount(trip.startDate, trip.endDate);

  // Static map strip URL for full card variant
  const lineColor = THEME_COLORS[trip.tripTheme] ?? THEME_COLORS.default;
  const staticMapUrl = !isCompact
    ? getStaticMapUrl(trip.cities, {
        width: 400,
        height: 48,
        lineColor,
      })
    : null;

  if (isCompact) {
    return (
      <Link href={`/trips/${trip.slug}`}>
        <motion.article
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="flex flex-row gap-3 p-3 bg-card rounded-[--radius-card] shadow-card transition-shadow duration-200 hover:shadow-[--shadow-card-hover]"
        >
          {/* Thumbnail */}
          <div className="w-24 h-24 rounded-lg relative overflow-hidden flex-shrink-0">
            {coverError ? (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center">
                <span className="font-heading text-2xl font-bold text-white/90">
                  {trip.title.charAt(0)}
                </span>
              </div>
            ) : (
              <Image
                src={trip.coverPhoto}
                alt={`Cover photo for ${trip.title}`}
                fill
                className="object-cover"
                sizes="96px"
                onError={() => setCoverError(true)}
                {...(trip.blurHash
                  ? { placeholder: "blur" as const, blurDataURL: trip.blurHash }
                  : {})}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 py-1 min-w-0">
            <h4 className="font-heading text-sm font-semibold text-heading truncate">
              {trip.title}
            </h4>
            <p className="text-xs text-muted italic line-clamp-1 mt-0.5">
              {trip.hookLine}
            </p>
            <div className="text-xs text-muted mt-2 flex items-center gap-2">
              <span>
                <span className="font-mono">{days}</span>
                <span className="font-body"> days</span>
              </span>
              <span className="text-border">|</span>
              <span className="font-mono">{trip.budgetTier}</span>
              <span className="text-border">|</span>
              <span className="font-body capitalize">{trip.tripType}</span>
            </div>
          </div>
        </motion.article>
      </Link>
    );
  }

  return (
    <Link href={`/trips/${trip.slug}`} className="block h-full">
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="h-full flex flex-col rounded-2xl overflow-hidden bg-card shadow-[0_1px_3px_rgba(0,0,0,0.06),0_4px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-shadow duration-300"
      >
        {/* Image */}
        <div className="relative aspect-[4/3]">
          {coverError ? (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40 flex items-center justify-center">
              <span className="font-heading text-4xl font-bold text-white/90">
                {trip.title.charAt(0)}
              </span>
            </div>
          ) : (
            <Image
              src={trip.coverPhoto}
              alt={`Cover photo for ${trip.title}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setCoverError(true)}
              {...(trip.blurHash
                ? { placeholder: "blur" as const, blurDataURL: trip.blurHash }
                : {})}
            />
          )}

          {/* Subtle vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />

          {/* State + date badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white text-[11px] md:text-xs px-3 py-1.5 rounded-full font-medium">
            <span className="font-body">{trip.states.join(", ")}</span>
            <span className="opacity-50">·</span>
            <span className="font-mono">{formatDate(trip.startDate)}</span>
          </div>
        </div>

        {/* Static map route strip */}
        {staticMapUrl && !mapError && (
          <div className="h-[48px] overflow-hidden opacity-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={staticMapUrl}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setMapError(true)}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4 md:p-5 flex flex-col flex-1">
          <h3 className="font-heading font-bold text-heading text-base md:text-lg leading-snug">
            {trip.title}
          </h3>
          <p className="font-body text-muted text-sm line-clamp-2 mt-1.5 leading-relaxed">
            {trip.hookLine}
          </p>

          {/* Tags — clean text pills */}
          <div className="flex flex-wrap gap-1.5 mt-3 max-h-[28px] overflow-hidden">
            {trip.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-medium text-primary-text bg-primary-soft/60 rounded-md px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
            {trip.tags.length > 4 && (
              <span className="text-[11px] font-medium text-muted rounded-md px-1.5 py-0.5">
                +{trip.tags.length - 4}
              </span>
            )}
          </div>

          {/* Stats — bottom aligned */}
          <div className="flex items-center gap-3 mt-auto pt-4 text-xs text-muted border-t border-border/40 mt-4">
            <span className="flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              <span className="font-mono font-medium">{days}</span> days
            </span>
            <span className="w-px h-3 bg-border/60" />
            <span className="flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              <span className="font-mono font-medium">{trip.budgetTier}</span>
            </span>
            <span className="w-px h-3 bg-border/60" />
            <span className="flex items-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
              <span className="capitalize">{trip.tripType}</span>
            </span>
          </div>
        </div>
      </motion.article>
    </Link>
  );
}
