"use client";

import { useState, useEffect } from "react";

export interface PlaceDetails {
  displayName: string;
  formattedAddress: string;
  rating?: number;
  userRatingCount?: number;
  openingHours?: string[];
  isOpenNow?: boolean;
  websiteUri?: string;
  googleMapsUri?: string;
  types?: string[];
  photoUrl?: string;
  editorialSummary?: string;
  geminiSummary?: string;
  location?: { latitude: number; longitude: number };
  source: "google" | "fallback";
}

/** Module-level in-memory cache so the same placeId isn't fetched twice in a session */
const cache = new Map<string, PlaceDetails>();

/** Tracks in-flight fetches to avoid duplicate requests for the same placeId */
const inflight = new Map<string, Promise<PlaceDetails | null>>();

export function usePlaceDetails(
  placeId: string,
  placeName: string,
  placeCity: string
): { details: PlaceDetails | null; loading: boolean } {
  const [details, setDetails] = useState<PlaceDetails | null>(
    () => cache.get(placeId) ?? null
  );
  const [loading, setLoading] = useState(!cache.has(placeId));

  useEffect(() => {
    if (!placeId) {
      setLoading(false);
      return;
    }

    // Already cached
    if (cache.has(placeId)) {
      setDetails(cache.get(placeId)!);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchDetails() {
      // If there's already an in-flight request for this placeId, wait for it
      let pending = inflight.get(placeId);
      if (!pending) {
        pending = (async () => {
          try {
            const params = new URLSearchParams({
              placeId,
              placeName,
              placeCity,
            });
            const res = await fetch(`/api/place-details?${params.toString()}`);
            if (!res.ok) return null;
            const data: PlaceDetails = await res.json();
            cache.set(placeId, data);
            return data;
          } catch {
            return null;
          } finally {
            inflight.delete(placeId);
          }
        })();
        inflight.set(placeId, pending);
      }

      const result = await pending;
      if (!cancelled) {
        setDetails(result);
        setLoading(false);
      }
    }

    fetchDetails();

    return () => {
      cancelled = true;
    };
  }, [placeId, placeName, placeCity]);

  return { details, loading };
}
