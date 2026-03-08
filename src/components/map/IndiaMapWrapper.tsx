"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import IndiaMap, { type MapViewMode } from "./IndiaMap";
import TripCard from "@/components/trip/TripCard";
import type { Trip } from "@/types";

interface IndiaMapWrapperProps {
  trips: Trip[];
  mapRevealed?: boolean;
  onViewModeChange?: (mode: MapViewMode) => void;
}

export default function IndiaMapWrapper({
  trips,
  mapRevealed,
  onViewModeChange,
}: IndiaMapWrapperProps) {
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [mapViewMode, setMapViewMode] = useState<MapViewMode>("full");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const updateMode = (mode: MapViewMode) => {
    setMapViewMode(mode);
    onViewModeChange?.(mode);
  };

  const handleStateSelect = (stateName: string) => {
    if (mapViewMode !== "full") return;
    clearTimers();
    setSelectedState(stateName);
    updateMode("zooming-in");

    // Wait for CSS zoom transition (0.8s) + small buffer before showing markers
    const t = setTimeout(() => updateMode("zoomed"), 900);
    timersRef.current.push(t);
  };

  const handleBack = useCallback(() => {
    if (mapViewMode !== "zoomed" && mapViewMode !== "zooming-in") return;
    clearTimers();
    updateMode("zooming-out");

    // First transition to "full" (zoom CSS animation finishes at ~800ms),
    // then clear selectedState slightly after so the state visuals
    // don't snap abruptly (its shadow/stroke transitions out smoothly)
    const t1 = setTimeout(() => updateMode("full"), 900);
    const t2 = setTimeout(() => setSelectedState(null), 1100);
    timersRef.current.push(t1, t2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapViewMode]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleBack();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleBack]);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  // Derive visited states from trip data
  const visitedStateNames = useMemo(
    () => new Set(trips.flatMap((t) => t.states)),
    [trips]
  );

  const tripsForState = selectedState
    ? trips.filter(
        (trip) => trip.published && trip.states.includes(selectedState)
      )
    : [];

  const isZoomed = mapViewMode === "zoomed" || mapViewMode === "zooming-in";

  return (
    <div className="relative">
      <IndiaMap
        onStateSelect={handleStateSelect}
        revealed={mapRevealed}
        selectedState={selectedState}
        mapViewMode={mapViewMode}
        visitedStateNames={visitedStateNames}
      />

      {/* Back button — large hit target, high z-index */}
      <AnimatePresence>
        {isZoomed && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            onClick={handleBack}
            className="absolute top-2 left-2 md:top-3 md:left-3 z-50 flex items-center justify-center gap-1.5 md:gap-2 bg-card shadow-card rounded-full px-3.5 py-2.5 md:px-5 md:py-2.5 min-h-[44px] text-xs md:text-sm font-body font-medium text-heading cursor-pointer hover:shadow-[--shadow-card-hover] transition-shadow select-none"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            Back
          </motion.button>
        )}
      </AnimatePresence>

      {/* State zoom panel — slides up below map as normal flow */}
      <AnimatePresence>
        {mapViewMode === "zoomed" && selectedState && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 28,
              delay: 0.3,
            }}
            className="mt-1 md:mt-2 mx-auto max-w-[500px] px-3 md:px-1"
          >
            <div className="bg-card shadow-card rounded-xl md:rounded-2xl p-3 md:p-4">
              <h3 className="font-heading text-sm md:text-sm font-semibold text-heading mb-2 md:mb-3">
                Trips in {selectedState}
              </h3>
              <div className="flex flex-col gap-2">
                {tripsForState.length > 0 ? (
                  tripsForState.map((trip) => (
                    <TripCard key={trip.id} trip={trip} isCompact />
                  ))
                ) : (
                  <p className="text-muted text-xs text-center py-3">
                    No trips here yet.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
