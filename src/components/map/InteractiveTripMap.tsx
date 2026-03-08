"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import type { Day, Place } from "@/types";
import type { CoordinateMap } from "@/hooks/usePlaceCoordinates";

// ---------------------------------------------------------------------------
// Theme color map
// ---------------------------------------------------------------------------

const THEME_COLORS: Record<string, string> = {
  rajasthan: "#D97706",
  kerala: "#059669",
  ladakh: "#7C3AED",
  himachal: "#0891B2",
  default: "#2B6CE6",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DayCoordData {
  dayNumber: number;
  places: { placeId: string; name: string; index: number; lat: number; lng: number }[];
}

interface InteractiveTripMapProps {
  days: Day[];
  dayPlaces: Record<string, Place[]>;
  activeDay: number;
  coordinates: CoordinateMap;
  tripTheme?: string;
  onMarkerClick?: (placeId: string, dayNumber: number) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function InteractiveTripMap({
  days,
  dayPlaces,
  activeDay,
  coordinates,
  tripTheme = "default",
  onMarkerClick,
  className,
}: InteractiveTripMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [fitAll, setFitAll] = useState(false);
  const mapboxRef = useRef<typeof import("mapbox-gl") | null>(null);
  // Track previous day layers so cleanup works across coord changes
  const prevDayNumbersRef = useRef<number[]>([]);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.replace(/^["']|["']$/g, "");
  const color = THEME_COLORS[tripTheme] || THEME_COLORS.default;

  // Stable serialization key for coordinates object
  const coordsKey = useMemo(
    () => JSON.stringify(coordinates),
    [coordinates]
  );

  // Memoized day coordinate data — only recomputes when days/places/coords change
  const dayCoordData: DayCoordData[] = useMemo(() => {
    return days.map((day) => {
      const places = (dayPlaces[day.id] ?? [])
        .filter((p) => coordinates[p.googlePlaceId])
        .map((p) => ({
          placeId: p.googlePlaceId,
          name: p.name,
          index: p.index,
          lat: coordinates[p.googlePlaceId].lat,
          lng: coordinates[p.googlePlaceId].lng,
        }));
      return { dayNumber: day.dayNumber, places };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, dayPlaces, coordsKey]);

  const allCoords: [number, number][] = useMemo(
    () => dayCoordData.flatMap((d) => d.places.map((p) => [p.lng, p.lat] as [number, number])),
    [dayCoordData]
  );

  const hasCoords = allCoords.length > 0;

  // Keep a ref of dayCoordData for use in effects without re-triggering them
  const dayCoordDataRef = useRef(dayCoordData);
  dayCoordDataRef.current = dayCoordData;

  const allCoordsRef = useRef(allCoords);
  allCoordsRef.current = allCoords;

  // ── Lazy load via IntersectionObserver ──
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Init map when visible + coords available ──
  useEffect(() => {
    if (!isVisible || !containerRef.current || !token || !hasCoords)
      return;

    // Don't re-init if map already exists
    if (mapRef.current) return;

    let map: mapboxgl.Map | undefined;

    import("mapbox-gl").then((mapboxgl) => {
      if (!containerRef.current) return;
      mapboxRef.current = mapboxgl;

      // Inject Mapbox CSS once
      if (!document.getElementById("mapbox-gl-css")) {
        const link = document.createElement("link");
        link.id = "mapbox-gl-css";
        link.rel = "stylesheet";
        link.href =
          "https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css";
        document.head.appendChild(link);
      }

      mapboxgl.default.accessToken = token;

      const bounds = new mapboxgl.default.LngLatBounds();
      allCoordsRef.current.forEach((c) => bounds.extend(c));

      map = new mapboxgl.default.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        bounds,
        fitBoundsOptions: { padding: 50, maxZoom: 15 },
        antialias: true,
        interactive: true,
        scrollZoom: false,
      });

      mapRef.current = map;

      map.addControl(
        new mapboxgl.default.NavigationControl({ showCompass: false }),
        "bottom-right"
      );

      map.on("load", () => {
        setMapReady(true);
      });
    });

    return () => {
      map?.remove();
      mapRef.current = null;
      markersRef.current = [];
      prevDayNumbersRef.current = [];
      setMapReady(false);
    };
  }, [isVisible, token, hasCoords]);

  // ── Draw/redraw markers and route lines ──
  useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxRef.current;
    if (!map || !mapboxgl || !mapReady) return;

    // Clear previous markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Remove previous route layers/sources
    prevDayNumbersRef.current.forEach((dayNum) => {
      const layerId = `route-day-${dayNum}`;
      const sourceId = `route-source-day-${dayNum}`;
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    });

    const data = dayCoordDataRef.current;
    prevDayNumbersRef.current = data.map((d) => d.dayNumber);

    // Add route lines and markers per day
    data.forEach((dayData) => {
      const isActive = dayData.dayNumber === activeDay;
      const opacity = fitAll || isActive ? 1 : 0.2;
      const sourceId = `route-source-day-${dayData.dayNumber}`;
      const layerId = `route-day-${dayData.dayNumber}`;

      // Route line
      if (dayData.places.length >= 2) {
        const lineCoords = dayData.places.map((p) => [p.lng, p.lat]);

        map.addSource(sourceId, {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: lineCoords },
          },
        });

        map.addLayer({
          id: layerId,
          type: "line",
          source: sourceId,
          layout: { "line-join": "round", "line-cap": "round" },
          paint: {
            "line-color": color,
            "line-width": isActive && !fitAll ? 3 : 2,
            "line-opacity": opacity * 0.7,
            "line-dasharray": [2, 1.5],
          },
        });
      }

      // Markers
      dayData.places.forEach((place) => {
        const el = document.createElement("div");
        el.style.cssText = `
          width: ${isActive && !fitAll ? "30px" : "24px"};
          height: ${isActive && !fitAll ? "30px" : "24px"};
          border-radius: 50%;
          background-color: ${color};
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isActive && !fitAll ? "12px" : "10px"};
          font-weight: 600;
          font-family: var(--font-heading), sans-serif;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          border: 2px solid white;
          cursor: pointer;
          opacity: ${opacity};
          transition: opacity 0.3s ease, transform 0.3s ease;
          ${isActive && !fitAll ? "transform: scale(1);" : "transform: scale(0.85);"}
        `;
        el.textContent = String(place.index);

        const wrapper = document.createElement("div");
        wrapper.style.cssText = `
          display: flex;
          flex-direction: column;
          align-items: center;
          pointer-events: auto;
        `;
        wrapper.appendChild(el);

        if (isActive && !fitAll) {
          const label = document.createElement("div");
          label.style.cssText = `
            margin-top: 2px;
            font-size: 10px;
            font-weight: 600;
            font-family: var(--font-heading), sans-serif;
            color: #374151;
            text-align: center;
            text-shadow: 0 1px 3px rgba(255,255,255,0.9);
            white-space: nowrap;
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
          `;
          label.textContent = place.name;
          wrapper.appendChild(label);
        }

        wrapper.addEventListener("click", () => {
          onMarkerClick?.(place.placeId, dayData.dayNumber);
        });

        const marker = new mapboxgl.default.Marker({
          element: wrapper,
          anchor: "bottom",
        })
          .setLngLat([place.lng, place.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    });
  }, [mapReady, activeDay, dayCoordData, fitAll, color, onMarkerClick]);

  // ── Fly to active day bounds when activeDay or fitAll changes ──
  useEffect(() => {
    const map = mapRef.current;
    const mapboxgl = mapboxRef.current;
    if (!map || !mapboxgl || !mapReady) return;

    if (fitAll) {
      const coords = allCoordsRef.current;
      if (coords.length > 0) {
        const bounds = new mapboxgl.default.LngLatBounds();
        coords.forEach((c) => bounds.extend(c));
        map.fitBounds(bounds, { padding: 50, maxZoom: 15, duration: 800 });
      }
      return;
    }

    // Find active day's coords
    const activeDayData = dayCoordDataRef.current.find(
      (d) => d.dayNumber === activeDay
    );
    if (!activeDayData || activeDayData.places.length === 0) return;

    if (activeDayData.places.length === 1) {
      const p = activeDayData.places[0];
      map.flyTo({ center: [p.lng, p.lat], zoom: 14, duration: 800 });
    } else {
      const bounds = new mapboxgl.default.LngLatBounds();
      activeDayData.places.forEach((p) =>
        bounds.extend([p.lng, p.lat] as [number, number])
      );
      map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 800 });
    }
  }, [activeDay, mapReady, fitAll]);

  // ── Toggle button handler ──
  const toggleFitAll = useCallback(() => {
    setFitAll((prev) => !prev);
  }, []);

  if (!token) return null;

  return (
    <div className={`relative ${className ?? ""}`}>
      <div
        ref={containerRef}
        className="w-full h-full rounded-2xl overflow-hidden bg-[var(--color-travel-row)]"
      />

      {/* Fit all / Fit day toggle */}
      {mapReady && hasCoords && (
        <button
          onClick={toggleFitAll}
          className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-md border border-black/5 hover:bg-white transition-colors cursor-pointer"
          title={fitAll ? "Focus on active day" : "Show all places"}
        >
          {fitAll ? (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
              Day {activeDay}
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
              All days
            </span>
          )}
        </button>
      )}

      {/* Loading state */}
      {!mapReady && isVisible && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--color-travel-row)] rounded-2xl">
          <div className="animate-pulse text-muted text-sm font-body">
            Loading map…
          </div>
        </div>
      )}
    </div>
  );
}
