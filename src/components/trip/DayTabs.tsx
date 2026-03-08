"use client";

import { useCallback, useEffect, useRef } from "react";
import type { Day } from "@/types";

interface DayTabsProps {
  days: Day[];
  activeDay: number;
  onDayChange: (dayNumber: number) => void;
}

export default function DayTabs({ days, activeDay, onDayChange }: DayTabsProps) {
  const tabRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Auto-scroll tab bar to keep active tab visible
  useEffect(() => {
    const el = tabRefs.current.get(activeDay);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeDay]);

  const handleTabClick = useCallback((dayNumber: number) => {
    onDayChange(dayNumber);

    const section = document.getElementById(`day-${dayNumber}`);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [onDayChange]);

  return (
    <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="max-w-4xl mx-auto lg:max-w-[1400px]">
        <div
          className="flex overflow-x-auto scrollbar-none px-3 md:px-6 lg:px-8 gap-1 lg:gap-0 lg:justify-start"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {days.map((day) => {
            const isActive = activeDay === day.dayNumber;
            return (
              <button
                key={day.dayNumber}
                ref={(el) => {
                  if (el) tabRefs.current.set(day.dayNumber, el);
                }}
                onClick={() => handleTabClick(day.dayNumber)}
                className={`flex-shrink-0 lg:flex-shrink lg:flex-1 lg:max-w-[140px] px-3.5 md:px-5 lg:px-4 py-2.5 md:py-3 text-center transition-all duration-200 cursor-pointer relative rounded-lg my-1 ${
                  isActive
                    ? "text-primary bg-primary-soft"
                    : "text-muted hover:text-heading hover:bg-black/[0.02]"
                }`}
              >
                <span className={`block text-[11px] md:text-xs font-mono leading-tight ${isActive ? "text-primary/60" : "opacity-50"}`}>
                  Day {day.dayNumber}
                </span>
                <span className="block whitespace-nowrap text-[13px] md:text-sm font-heading font-medium mt-0.5">
                  {day.city}
                </span>
                {/* Active underline */}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
