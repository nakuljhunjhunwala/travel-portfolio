"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Trip } from "@/types";
import type { MapViewMode } from "@/components/map/IndiaMap";
import IndiaMapWrapper from "@/components/map/IndiaMapWrapper";
import { useEmbedTheme } from "@/hooks/useEmbedTheme";
import { sendToParent } from "@/lib/embed-messenger";

interface EmbedMapContentProps {
  trips: Trip[];
}

const TOTAL_INDIAN_STATES = 36;

function CoverageRing({
  visited,
  total,
}: {
  visited: number;
  total: number;
}) {
  const r = 16;
  const circumference = 2 * Math.PI * r;
  const pct = visited / total;

  return (
    <div className="flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1">
      <div className="relative w-8 h-8 flex-shrink-0">
        <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
          <circle cx="20" cy="20" r={r} fill="none" stroke="currentColor" strokeWidth="2.5" opacity={0.15} />
          <motion.circle
            cx="20"
            cy="20"
            r={r}
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - pct) }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-heading font-bold text-heading leading-none">
            {visited}
          </span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-heading font-semibold text-heading leading-tight">
          States
        </span>
        <span className="text-[8px] font-mono text-muted leading-tight">
          {Math.round(pct * 100)}% of India
        </span>
      </div>
    </div>
  );
}

function EmbedMapInner({ trips }: EmbedMapContentProps) {
  const theme = useEmbedTheme();
  const [mapViewMode, setMapViewMode] = useState<MapViewMode>("full");
  const isMapZoomed = mapViewMode !== "full";
  const isDarkTheme = theme === "glass" || theme === "retro" || theme === "code" || theme === "terminal";

  const stats = useMemo(() => {
    const allVisible = trips.filter((t) => t.status !== "draft");
    const totalStates = new Set(allVisible.flatMap((t) => t.states)).size;
    const totalCities = new Set(allVisible.flatMap((t) => t.cities)).size;
    const totalCost = allVisible.reduce((sum, t) => sum + t.totalCost, 0);
    return { totalStates, totalCities, totalCost };
  }, [trips]);

  const formatCost = (cost: number) => {
    if (cost >= 100000) return `${(cost / 100000).toFixed(1).replace(/\.0$/, "")}L`;
    if (cost >= 1000) return `${(cost / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    return `${cost}`;
  };

  // Signal ready to parent on mount
  useEffect(() => {
    sendToParent({ type: "TRAVEL_EMBED_READY" });
  }, []);

  return (
    <div
      className="flex flex-col items-center px-2 py-1 rounded-lg"
      style={{
        background: isDarkTheme ? "rgba(255,255,255,0.03)" : "transparent",
      }}
    >
      {/* Compact stat bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: isMapZoomed ? 0 : 1, y: isMapZoomed ? -8 : 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-3 mb-0"
      >
        <CoverageRing visited={stats.totalStates} total={TOTAL_INDIAN_STATES} />
        <div className="flex gap-2">
          <span className="text-[10px] font-mono text-muted rounded-full px-2 py-0.5 border border-border/30">
            {stats.totalCities}+ cities
          </span>
          <span className="text-[10px] font-mono text-muted rounded-full px-2 py-0.5 border border-border/30">
            {formatCost(stats.totalCost)} spent
          </span>
        </div>
      </motion.div>

      {/* Map */}
      <div className="w-full max-w-md mx-auto -mt-1">
        <IndiaMapWrapper
          trips={trips}
          mapRevealed={true}
          onViewModeChange={setMapViewMode}
        />
      </div>
    </div>
  );
}

export default function EmbedMapContent({ trips }: EmbedMapContentProps) {
  return (
    <Suspense>
      <EmbedMapInner trips={trips} />
    </Suspense>
  );
}
