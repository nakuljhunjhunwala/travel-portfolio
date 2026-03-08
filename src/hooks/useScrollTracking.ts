"use client";

import { useEffect, useRef } from "react";
import { trackDayView } from "@/lib/analytics";

export function useScrollTracking(tripId: string, uid: string | null) {
  const recordedDays = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!uid) return;

    const sections = document.querySelectorAll("[data-day-number]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const dayNumber = Number(
              (entry.target as HTMLElement).dataset.dayNumber
            );
            if (!recordedDays.current.has(dayNumber)) {
              recordedDays.current.add(dayNumber);
              trackDayView(tripId, uid, dayNumber);
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [tripId, uid]);
}
