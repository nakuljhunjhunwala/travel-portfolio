"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Trip } from "@/types";

interface ComingSoonContentProps {
  trip: Trip;
}

export default function ComingSoonContent({ trip }: ComingSoonContentProps) {
  const dateRange = trip.visitedDate
    || `${new Date(trip.startDate.seconds * 1000).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;

  return (
    <main className="min-h-screen bg-bg" data-trip-theme={trip.tripTheme}>
      {/* Hero */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <Image
          src={trip.coverPhoto}
          alt={trip.title}
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Back button */}
        <Link
          href="/"
          className="absolute top-4 left-4 md:top-6 md:left-6 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-body font-medium text-heading shadow-card hover:shadow-[--shadow-card-hover] transition-shadow"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        {/* Coming Soon badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="absolute bottom-6 left-4 right-4 md:left-8 md:right-8"
        >
          <span className="inline-flex items-center gap-1.5 bg-amber-500/90 backdrop-blur-sm text-white text-xs font-mono font-medium px-3 py-1.5 rounded-full mb-3">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Itinerary Coming Soon
          </span>
          <h1 className="font-heading text-2xl md:text-4xl font-bold text-white leading-tight">
            {trip.title}
          </h1>
        </motion.div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="max-w-2xl mx-auto px-4 md:px-6 py-8 md:py-12"
      >
        {/* Meta card */}
        <div className="bg-card rounded-2xl shadow-card p-5 md:p-6 mb-6">
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted font-body mb-4">
            <span className="inline-flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {trip.states.join(", ")}
            </span>
            <span className="text-border-dashed">·</span>
            <span>{trip.cities.join(", ")}</span>
            <span className="text-border-dashed">·</span>
            <span className="font-mono">{dateRange}</span>
          </div>

          <p className="font-body text-body text-base md:text-lg leading-relaxed">
            {trip.hookLine}
          </p>

          {trip.visitedHighlight && (
            <p className="font-body text-muted text-sm md:text-base leading-relaxed mt-3 italic">
              {trip.visitedHighlight}
            </p>
          )}
        </div>

        {/* Trip DNA — if meaningful */}
        {(trip.tripDNA.nature > 0 || trip.tripDNA.food > 0 || trip.tripDNA.culture > 0) && (
          <div className="bg-card rounded-2xl shadow-card p-5 md:p-6 mb-6">
            <h2 className="font-heading text-sm font-semibold text-heading mb-3">Trip DNA</h2>
            <div className="space-y-2.5">
              {[
                { label: "Nature", value: trip.tripDNA.nature, icon: "🌿" },
                { label: "Food", value: trip.tripDNA.food, icon: "🍜" },
                { label: "Culture", value: trip.tripDNA.culture, icon: "🏛️" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="text-sm w-5 text-center">{item.icon}</span>
                  <span className="font-body text-xs text-muted w-14">{item.label}</span>
                  <div className="flex-1 h-2 bg-primary-soft rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.value}%` }}
                      transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                  <span className="font-mono text-xs text-muted w-8 text-right">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick highlights */}
        <div className="bg-card rounded-2xl shadow-card p-5 md:p-6 mb-6">
          <div className="space-y-4">
            {trip.bestMoment && (
              <div>
                <h3 className="font-heading text-xs font-semibold text-primary uppercase tracking-wide mb-1">Best Moment</h3>
                <p className="font-body text-body text-sm leading-relaxed">{trip.bestMoment}</p>
              </div>
            )}
            {trip.skipThis && (
              <div>
                <h3 className="font-heading text-xs font-semibold text-red-500 uppercase tracking-wide mb-1">Skip This</h3>
                <p className="font-body text-body text-sm leading-relaxed">{trip.skipThis}</p>
              </div>
            )}
            {trip.bestMonth && (
              <div>
                <h3 className="font-heading text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-1">Best Time to Visit</h3>
                <p className="font-body text-body text-sm leading-relaxed">{trip.bestMonth}</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-6">
          <p className="font-body text-muted text-sm mb-4">
            The detailed day-by-day itinerary with places, costs, and honest notes is being prepared.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-white font-body font-medium text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0" />
              <path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20" />
              <path d="M2 12h20" />
            </svg>
            Explore the Map
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
