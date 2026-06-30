"use client";

import { useEffect, useRef } from "react";
import type { User } from "firebase/auth";
import { track } from "@/lib/analytics";

/**
 * Records a trip "open" (view for signed-in, preview for anonymous) once, then
 * a per-day event as each day scrolls into view for signed-in readers.
 *
 * `dayCount` is included so the observer re-attaches when the full itinerary
 * loads client-side after sign-in (the day sections don't exist at first paint).
 */
export function useScrollTracking(
  tripSlug: string,
  user: User | null,
  dayCount: number
) {
  const viewFired = useRef(false);
  const previewFired = useRef(false);
  const recordedDays = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (user && !viewFired.current) {
      viewFired.current = true;
      track({ tripSlug, kind: "view", user });
    }
    if (!user && !previewFired.current) {
      previewFired.current = true;
      track({ tripSlug, kind: "preview" });
    }

    if (!user) return;

    const sections = document.querySelectorAll("[data-day-number]");
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const dayNumber = Number(
              (entry.target as HTMLElement).dataset.dayNumber
            );
            if (dayNumber && !recordedDays.current.has(dayNumber)) {
              recordedDays.current.add(dayNumber);
              track({ tripSlug, kind: "day", dayNumber, user });
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [tripSlug, user, dayCount]);
}
