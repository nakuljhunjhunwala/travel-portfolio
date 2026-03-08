"use client";

import { useEffect, useState, useRef, useCallback } from "react";

/**
 * Observes `[data-day-number]` sections and returns the currently visible
 * day number. Returns a `suppress()` function to temporarily pause the
 * observer — call it before programmatic scrolls to prevent fighting.
 */
export function useActiveDayObserver(totalDays: number): {
  activeDay: number;
  suppress: () => void;
} {
  const [activeDay, setActiveDay] = useState(1);
  const suppressedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /** Suppress observer for 1s — call before programmatic scrolls */
  const suppress = useCallback(() => {
    suppressedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      suppressedRef.current = false;
    }, 1000);
  }, []);

  useEffect(() => {
    if (totalDays === 0) return;

    // Small delay to let DOM settle after render
    const initTimer = setTimeout(() => {
      const sections = document.querySelectorAll<HTMLElement>("[data-day-number]");
      if (sections.length === 0) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (suppressedRef.current) return;

          // Pick the topmost intersecting section
          let topEntry: IntersectionObserverEntry | null = null;
          for (const entry of entries) {
            if (entry.isIntersecting) {
              if (!topEntry || entry.boundingClientRect.top < topEntry.boundingClientRect.top) {
                topEntry = entry;
              }
            }
          }
          if (topEntry) {
            const num = Number(topEntry.target.getAttribute("data-day-number"));
            if (num) setActiveDay(num);
          }
        },
        { rootMargin: "-60px 0px -70% 0px" }
      );

      sections.forEach((s) => observer.observe(s));
      observerRef.current = observer;
    }, 200);

    return () => {
      clearTimeout(initTimer);
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [totalDays]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { activeDay, suppress };
}

/**
 * Programmatically scroll to a day section.
 */
export function scrollToDay(dayNumber: number): void {
  const section = document.getElementById(`day-${dayNumber}`);
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
