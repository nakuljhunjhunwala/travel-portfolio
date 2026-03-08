"use client";

import Image from "next/image";
import { getStaticMapUrl } from "@/lib/mapbox";

/* ── Per-trip theme → line color (hex without #) ── */

const THEME_LINE_COLORS: Record<string, string> = {
  rajasthan: "D97706",
  kerala: "059669",
  ladakh: "7C3AED",
};

const DEFAULT_LINE_COLOR = "2B6CE6";

interface StaticTripMapProps {
  cities: string[];
  tripTheme?: string;
  lineColor?: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function StaticTripMap({
  cities,
  tripTheme,
  lineColor,
  width = 800,
  height = 300,
  className,
}: StaticTripMapProps) {
  // Resolve line color: explicit prop > theme lookup > default
  const resolvedColor =
    lineColor ??
    (tripTheme ? THEME_LINE_COLORS[tripTheme] : undefined) ??
    DEFAULT_LINE_COLOR;

  const url = getStaticMapUrl(cities, {
    width,
    height,
    lineColor: resolvedColor,
  });

  if (!url) {
    // No token or insufficient cities — render a subtle placeholder
    return (
      <div
        className={`bg-card border border-border/60 flex items-center justify-center ${className ?? ""}`}
        style={{ aspectRatio: `${width}/${height}` }}
      >
        <div className="flex flex-col items-center gap-2 text-muted/50">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
          </svg>
          <span className="font-body text-xs">Route map</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <Image
        src={url}
        alt="Trip route map"
        width={width * 2}
        height={height * 2}
        className="w-full h-auto object-cover"
        unoptimized
      />
      {/* Subtle bottom gradient for text readability if needed */}
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
    </div>
  );
}
