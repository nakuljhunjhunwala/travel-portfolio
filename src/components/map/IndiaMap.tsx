"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
} from "react-simple-maps";
import { stateZoomConfig, type CityPin } from "@/data/state-zoom-config";

const INDIA_TOPO_URL = "/data/india-states-topo.json";

export type MapViewMode = "full" | "zooming-in" | "zoomed" | "zooming-out";

interface IndiaMapProps {
  onStateSelect: (stateName: string) => void;
  revealed?: boolean;
  selectedState: string | null;
  mapViewMode: MapViewMode;
  visitedStateNames?: Set<string>;
  comingSoonStateNames?: Set<string>;
  tripCountByState?: Record<string, number>;
}

// --- Smart label placement ---
// Approximates the geoMercator projection to get SVG positions,
// then greedily assigns label slots (top/right/left/bottom) to avoid overlaps.
// If all close slots collide, uses extended positions with a leader line.
// O(n² * 8) — instant for ≤ 10 cities.

const DEG = Math.PI / 180;

function geoToSvg(lon: number, lat: number): [number, number] {
  const x = 250 + 1000 * (lon - 82) * DEG;
  const y =
    275 -
    1000 *
      (Math.log(Math.tan(Math.PI / 4 + (lat * DEG) / 2)) -
        Math.log(Math.tan(Math.PI / 4 + (22 * DEG) / 2)));
  return [x, y];
}

interface LabelPlacement {
  anchor: "start" | "middle" | "end";
  dx: number;
  dy: number;
  extended: boolean;
}

type Rect = { x: number; y: number; w: number; h: number };

function computeSmartLabels(
  cities: CityPin[],
  zoom: number
): LabelPlacement[] {
  if (cities.length === 0) return [];

  const fontSize = 13 / zoom;
  const labelH = fontSize * 1.4;
  const pinR = 3.5 / zoom;
  const nearGap = pinR + 1.5 / zoom;
  const farGap = pinR + 10 / zoom;

  const svgPos = cities.map((c) =>
    geoToSvg(c.coordinates[0], c.coordinates[1])
  );
  const labelW = cities.map((c) => c.name.length * fontSize * 0.62);

  const makeCandidates = (idx: number, gap: number, extended: boolean) => {
    const [px, py] = svgPos[idx];
    const w = labelW[idx];
    const vc = fontSize * 0.35;
    return [
      {
        anchor: "middle" as const,
        dx: 0,
        dy: -gap,
        extended,
        rect: { x: px - w / 2, y: py - gap - labelH, w, h: labelH },
      },
      {
        anchor: "start" as const,
        dx: gap,
        dy: vc,
        extended,
        rect: { x: px + gap, y: py - labelH / 2, w, h: labelH },
      },
      {
        anchor: "end" as const,
        dx: -gap,
        dy: vc,
        extended,
        rect: { x: px - gap - w, y: py - labelH / 2, w, h: labelH },
      },
      {
        anchor: "middle" as const,
        dx: 0,
        dy: gap + fontSize,
        extended,
        rect: { x: px - w / 2, y: py + gap, w, h: labelH },
      },
    ];
  };

  const rectsOverlap = (a: Rect, b: Rect): boolean =>
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  const overlapsAnyPin = (rect: Rect, excludeIdx: number): boolean => {
    for (let i = 0; i < svgPos.length; i++) {
      if (i === excludeIdx) continue;
      const [px, py] = svgPos[i];
      if (
        px + pinR > rect.x &&
        px - pinR < rect.x + rect.w &&
        py + pinR > rect.y &&
        py - pinR < rect.y + rect.h
      )
        return true;
    }
    return false;
  };

  const placed: Rect[] = [];
  const result: LabelPlacement[] = [];

  for (let i = 0; i < cities.length; i++) {
    const candidates = [
      ...makeCandidates(i, nearGap, false),
      ...makeCandidates(i, farGap, true),
    ];

    let chosen = candidates[0];
    for (const c of candidates) {
      if (
        !placed.some((p) => rectsOverlap(c.rect, p)) &&
        !overlapsAnyPin(c.rect, i)
      ) {
        chosen = c;
        break;
      }
    }

    placed.push(chosen.rect);
    result.push({
      anchor: chosen.anchor,
      dx: chosen.dx,
      dy: chosen.dy,
      extended: chosen.extended,
    });
  }

  return result;
}

// --- Component ---

export default function IndiaMap({
  onStateSelect,
  revealed,
  selectedState,
  mapViewMode,
  visitedStateNames,
  comingSoonStateNames,
  tripCountByState,
}: IndiaMapProps) {
  const [revealDone, setRevealDone] = useState(false);

  useEffect(() => {
    if (revealed && !revealDone) {
      const timer = setTimeout(() => setRevealDone(true), 800);
      return () => clearTimeout(timer);
    }
  }, [revealed, revealDone]);

  const isVisited = (stateName: string): boolean => {
    return visitedStateNames ? visitedStateNames.has(stateName) : false;
  };

  const isComingSoon = (stateName: string): boolean => {
    return comingSoonStateNames ? comingSoonStateNames.has(stateName) : false;
  };

  const getVisitedClass = (visited: boolean): string => {
    if (!visited) return "";
    if (revealed && !revealDone) return "india-map-state-reveal";
    return "india-map-visited";
  };

  const isZooming = mapViewMode === "zooming-in" || mapViewMode === "zoomed";
  const isZoomingOut = mapViewMode === "zooming-out";
  const zoomConfig = selectedState ? stateZoomConfig[selectedState] : null;

  const zoomCenter: [number, number] =
    (isZooming || isZoomingOut) && zoomConfig && mapViewMode !== "zooming-out"
      ? zoomConfig.center
      : [82, 22];
  const zoomLevel =
    (isZooming || isZoomingOut) && zoomConfig && mapViewMode !== "zooming-out"
      ? zoomConfig.zoom
      : 1;

  // Compute adaptive label positions only when zoomed
  const labelPlacements = useMemo(() => {
    if (mapViewMode !== "zoomed" || !selectedState) return [];
    const config = stateZoomConfig[selectedState];
    if (!config) return [];
    return computeSmartLabels(config.cities, config.zoom);
  }, [mapViewMode, selectedState]);

  return (
    <div className="mx-auto max-w-[500px]">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center: [82, 22],
          scale: 1000,
        }}
        width={500}
        height={550}
        style={{ width: "100%", height: "auto", overflow: "visible" }}
      >
        <defs>
          {/* Premium gradient fills — muted teal for visited, warm parchment for unvisited */}
          <linearGradient id="visited-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2C5F7C" />
            <stop offset="100%" stopColor="#4F8DA8" />
          </linearGradient>
          <linearGradient id="unvisited-fill" x1="0" y1="0" x2="0.15" y2="1">
            <stop offset="0%" stopColor="#E2DDD6" />
            <stop offset="100%" stopColor="#D4CFC7" />
          </linearGradient>
          <filter
            id="state-depth"
            x="-20%"
            y="-20%"
            width="140%"
            height="150%"
          >
            <feGaussianBlur
              in="SourceAlpha"
              stdDeviation="3"
              result="blur"
            />
            <feOffset dx="0" dy="2" result="offsetBlur" />
            <feFlood floodColor="rgba(40,35,30,0.15)" result="color" />
            <feComposite
              in="color"
              in2="offsetBlur"
              operator="in"
              result="shadow"
            />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <ZoomableGroup
          center={zoomCenter}
          zoom={zoomLevel}
          minZoom={1}
          maxZoom={8}
        >
          <Geographies geography={INDIA_TOPO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const stateName = geo.properties.name as string;
                const visited = isVisited(stateName);
                const comingSoon = isComingSoon(stateName);
                // A state is "interactive" if it has published or coming_soon trips
                const interactive = visited || comingSoon;
                const isSelected = stateName === selectedState;

                // During zoom-out, non-selected states transition back to normal
                // opacity (CSS handles the animation) instead of staying invisible
                const computedOpacity = isZooming
                  ? isSelected
                    ? 1.0
                    : 0
                  : isZoomingOut
                    ? isSelected
                      ? 1.0
                      : interactive
                        ? comingSoon && !visited ? 0.4 : 0.85
                        : 1
                    : interactive
                      ? comingSoon && !visited ? 0.4 : 0.85
                      : 1;

                const computedStroke = isZooming
                  ? isSelected
                    ? "rgba(30,55,70,0.2)"
                    : "transparent"
                  : isZoomingOut
                    ? isSelected
                      ? "rgba(30,55,70,0.2)"
                      : "rgba(255,255,255,0.3)"
                    : comingSoon && !visited
                      ? "#2C5F7C"
                      : "rgba(255,255,255,0.3)";
                const computedStrokeDasharray =
                  comingSoon && !visited && !isZooming && !isZoomingOut
                    ? "3 2"
                    : undefined;
                const computedStrokeWidth =
                  isSelected && isZooming
                    ? 0.6
                    : comingSoon && !visited && !isZooming && !isZoomingOut
                      ? 0.8
                      : 0.5;

                const computedFilter =
                  isSelected && isZooming ? "url(#state-depth)" : "none";

                // Disable pointer events on invisible/non-interactive states
                // so clicks pass through to the back button and other UI
                const pe =
                  mapViewMode === "full" && interactive ? "auto" : ("none" as const);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onClick={() => {
                      if (interactive && mapViewMode === "full") {
                        onStateSelect(stateName);
                      }
                    }}
                    style={{
                      default: {
                        fill: interactive ? "url(#visited-fill)" : "url(#unvisited-fill)",
                        fillOpacity: computedOpacity,
                        stroke: computedStroke,
                        strokeWidth: computedStrokeWidth,
                        strokeDasharray: computedStrokeDasharray,
                        outline: "none",
                        filter: computedFilter,
                        pointerEvents: pe,
                        cursor:
                          mapViewMode === "full" && interactive
                            ? "pointer"
                            : "default",
                        transition:
                          "fill-opacity 0.6s ease, stroke 0.4s ease, stroke-width 0.3s ease, filter 0.4s ease",
                      },
                      hover: {
                        fill: interactive ? "url(#visited-fill)" : "url(#unvisited-fill)",
                        fillOpacity: computedOpacity,
                        stroke: computedStroke,
                        strokeWidth: computedStrokeWidth,
                        strokeDasharray: computedStrokeDasharray,
                        outline: "none",
                        filter:
                          interactive && mapViewMode === "full"
                            ? "brightness(1.15)"
                            : computedFilter,
                        pointerEvents: pe,
                        cursor:
                          mapViewMode === "full" && interactive
                            ? "pointer"
                            : "default",
                        transition:
                          "fill-opacity 0.6s ease, stroke 0.4s ease, stroke-width 0.3s ease, filter 0.2s ease",
                      },
                      pressed: {
                        fill: interactive ? "url(#visited-fill)" : "url(#unvisited-fill)",
                        fillOpacity:
                          isZooming && isSelected
                            ? 1.0
                            : interactive
                              ? comingSoon && !visited
                                ? 0.25
                                : 0.85
                              : 1,
                        stroke: computedStroke,
                        strokeWidth: computedStrokeWidth,
                        strokeDasharray: computedStrokeDasharray,
                        outline: "none",
                        filter: computedFilter,
                        pointerEvents: pe,
                        cursor:
                          mapViewMode === "full" && interactive
                            ? "pointer"
                            : "default",
                        transition:
                          "fill-opacity 0.6s ease, stroke 0.4s ease, stroke-width 0.3s ease",
                      },
                    }}
                    className={
                      isZooming || isZoomingOut ? "" : getVisitedClass(visited)
                    }
                  />
                );
              })
            }
          </Geographies>

          {/* City markers with smart label placement */}
          {mapViewMode === "zoomed" &&
            zoomConfig &&
            zoomConfig.cities.map((city, i) => {
              const z = zoomConfig.zoom;
              const label = labelPlacements[i];
              if (!label) return null;

              const fontSize = 13 / z;
              const pinR = 3.5 / z;

              return (
                <Marker key={city.name} coordinates={city.coordinates}>
                  <g
                    className="city-marker-enter"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {/* Leader line when label is placed far from pin */}
                    {label.extended && (
                      <line
                        x1={0}
                        y1={0}
                        x2={label.dx * 0.7}
                        y2={label.dy * 0.7}
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth={0.5 / z}
                        strokeDasharray={`${2 / z} ${1.5 / z}`}
                      />
                    )}
                    {/* Pin dot */}
                    <circle
                      r={pinR}
                      fill="#FFFFFF"
                      stroke="#2C5F7C"
                      strokeWidth={1.2 / z}
                    />
                    <circle r={pinR * 0.45} fill="#2C5F7C" />
                    {/* City name label — white text with dark halo */}
                    <text
                      textAnchor={label.anchor}
                      x={label.dx}
                      y={label.dy}
                      style={{
                        fontSize: `${fontSize}px`,
                        fontFamily: "var(--font-heading)",
                        fill: "#FFFFFF",
                        fontWeight: 600,
                        paintOrder: "stroke",
                        stroke: "rgba(0,0,0,0.45)",
                        strokeWidth: `${3.5 / z}px`,
                        strokeLinejoin: "round",
                      }}
                    >
                      {city.name}
                    </text>
                  </g>
                </Marker>
              );
            })}
          {/* Trip count dots at state centroids */}
          {mapViewMode === "full" &&
            revealed &&
            tripCountByState &&
            Object.entries(tripCountByState).map(
              ([stateName, count], idx) => {
                const config = stateZoomConfig[stateName];
                if (!config || count === 0) return null;
                const dots = Math.min(count, 4);
                return (
                  <Marker
                    key={`dots-${stateName}`}
                    coordinates={config.center}
                  >
                    <g
                      className="trip-dot-enter"
                      style={{
                        animationDelay: `${0.2 + idx * 0.06}s`,
                      }}
                    >
                      {Array.from({ length: dots }).map((_, i) => (
                        <circle
                          key={i}
                          cx={(i - (dots - 1) / 2) * 5.5}
                          cy={0}
                          r={1.8}
                          fill="rgba(255,255,255,0.9)"
                          stroke="rgba(0,0,0,0.1)"
                          strokeWidth={0.3}
                        />
                      ))}
                    </g>
                  </Marker>
                );
              }
            )}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
}
