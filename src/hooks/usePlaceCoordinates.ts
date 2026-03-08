"use client";

import { useState, useEffect, useMemo } from "react";
import type { Day, Place } from "@/types";

export type CoordinateMap = Record<string, { lat: number; lng: number }>;

/** Module-level cache keyed by sorted placeId string */
const cache = new Map<string, CoordinateMap>();
const inflight = new Map<string, Promise<CoordinateMap>>();

export function usePlaceCoordinates(
  days: Day[],
  dayPlaces: Record<string, Place[]>
): { coordinates: CoordinateMap; loading: boolean } {
  // Collect all unique placeIds
  const placeIds = useMemo(() => {
    const ids = new Set<string>();
    for (const day of days) {
      const places = dayPlaces[day.id] ?? [];
      for (const place of places) {
        if (place.googlePlaceId) ids.add(place.googlePlaceId);
      }
    }
    return Array.from(ids).sort();
  }, [days, dayPlaces]);

  const cacheKey = placeIds.join(",");

  const [coordinates, setCoordinates] = useState<CoordinateMap>(
    () => cache.get(cacheKey) ?? {}
  );
  const [loading, setLoading] = useState(
    placeIds.length > 0 && !cache.has(cacheKey)
  );

  useEffect(() => {
    if (placeIds.length === 0) {
      setLoading(false);
      return;
    }

    if (cache.has(cacheKey)) {
      setCoordinates(cache.get(cacheKey)!);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchCoords() {
      let pending = inflight.get(cacheKey);
      if (!pending) {
        pending = (async () => {
          try {
            const res = await fetch("/api/place-coordinates", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ placeIds }),
            });
            if (!res.ok) return {};
            const data: CoordinateMap = await res.json();
            cache.set(cacheKey, data);
            return data;
          } catch {
            return {};
          } finally {
            inflight.delete(cacheKey);
          }
        })();
        inflight.set(cacheKey, pending);
      }

      const result = await pending;
      if (!cancelled) {
        setCoordinates(result);
        setLoading(false);
      }
    }

    fetchCoords();

    return () => {
      cancelled = true;
    };
  }, [cacheKey, placeIds]);

  return { coordinates, loading };
}
