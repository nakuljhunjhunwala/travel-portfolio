"use client";

import { useEffect, useRef, useState } from "react";

/* ── Theme color map ── */
const THEME_COLORS: Record<string, string> = {
  rajasthan: "#D97706",
  kerala: "#059669",
  ladakh: "#7C3AED",
  default: "#2B6CE6",
};

/* ── City coordinates (lng, lat — Mapbox order) ── */
const CITY_COORDS: Record<string, [number, number]> = {
  Jaipur: [75.7873, 26.9124],
  Jodhpur: [73.0243, 26.2389],
  Jaisalmer: [70.9083, 26.9157],
  Udaipur: [73.7125, 24.5854],
  Manali: [77.1892, 32.2396],
  Kasol: [77.315, 32.0101],
  Tosh: [77.454, 32.04],
  Kheerganga: [77.495, 32.029],
  Kochi: [76.2673, 9.9312],
  Alleppey: [76.3388, 9.4981],
  Munnar: [77.0595, 10.0889],
  Varkala: [76.7156, 8.7379],
  Leh: [77.5771, 34.1526],
  "Nubra Valley": [77.56, 34.68],
  "Pangong Tso": [78.66, 33.759],
  Hanle: [78.975, 32.7797],
};

/* ── Props ── */
interface TripMapProps {
  cities: string[];
  tripTheme?: string;
  className?: string;
}

export default function TripMap({
  cities,
  tripTheme = "default",
  className,
}: TripMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<mapboxgl.Map | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  /* ── No token = no render ── */
  if (!token) return null;

  /* ── Lazy load: IntersectionObserver ── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
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
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /* ── Init map when visible ── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (!isVisible || !containerRef.current) return;

    let map: mapboxgl.Map | undefined;

    import("mapbox-gl").then((mapboxgl) => {
      if (!containerRef.current) return;

      /* Inject Mapbox CSS once */
      if (!document.getElementById("mapbox-gl-css")) {
        const link = document.createElement("link");
        link.id = "mapbox-gl-css";
        link.rel = "stylesheet";
        link.href =
          "https://api.mapbox.com/mapbox-gl-js/v3.12.0/mapbox-gl.css";
        document.head.appendChild(link);
      }

      mapboxgl.default.accessToken = token;

      const coords = cities
        .map((c) => CITY_COORDS[c])
        .filter(Boolean);

      if (coords.length === 0) return;

      /* Calculate bounds */
      const bounds = new mapboxgl.default.LngLatBounds();
      coords.forEach((c) => bounds.extend(c as [number, number]));

      map = new mapboxgl.default.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/outdoors-v12",
        bounds: bounds,
        fitBoundsOptions: { padding: 60 },
        pitch: 45,
        bearing: -20,
        antialias: true,
        interactive: true,
        scrollZoom: false,
      });

      mapInstanceRef.current = map;

      const color = THEME_COLORS[tripTheme] || THEME_COLORS.default;

      map.on("load", () => {
        if (!map) return;

        /* Route line */
        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: coords,
            },
          },
        });

        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": color,
            "line-width": 3,
            "line-opacity": 0.8,
            "line-dasharray": [2, 1],
          },
        });

        /* Numbered city markers with labels */
        coords.forEach((coord, i) => {
          const el = document.createElement("div");
          el.style.width = "28px";
          el.style.height = "28px";
          el.style.borderRadius = "50%";
          el.style.backgroundColor = color;
          el.style.color = "white";
          el.style.display = "flex";
          el.style.alignItems = "center";
          el.style.justifyContent = "center";
          el.style.fontSize = "12px";
          el.style.fontWeight = "600";
          el.style.fontFamily = "var(--font-heading), sans-serif";
          el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
          el.style.border = "2px solid white";
          el.textContent = String(i + 1);

          const label = document.createElement("div");
          label.style.marginTop = "4px";
          label.style.fontSize = "11px";
          label.style.fontWeight = "600";
          label.style.fontFamily = "var(--font-heading), sans-serif";
          label.style.color = "#374151";
          label.style.textAlign = "center";
          label.style.textShadow = "0 1px 3px rgba(255,255,255,0.8)";
          label.style.whiteSpace = "nowrap";
          label.textContent = cities[i];

          const container = document.createElement("div");
          container.style.display = "flex";
          container.style.flexDirection = "column";
          container.style.alignItems = "center";
          container.appendChild(el);
          container.appendChild(label);

          new mapboxgl.default.Marker({ element: container, anchor: "bottom" })
            .setLngLat(coord as [number, number])
            .addTo(map!);
        });
      });
    });

    return () => {
      map?.remove();
      mapInstanceRef.current = null;
    };
  }, [isVisible, cities, tripTheme, token]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-[280px] md:h-[350px] rounded-2xl overflow-hidden bg-[var(--color-travel-row)] ${className ?? ""}`}
    />
  );
}
