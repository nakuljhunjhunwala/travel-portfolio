/**
 * Mapbox Static Images helper — generates zero-JS map thumbnail URLs.
 *
 * Uses hardcoded city coordinates to draw a route polyline on a static
 * Mapbox map image. Returns null when `NEXT_PUBLIC_MAPBOX_TOKEN` is empty
 * so the UI can gracefully fall back.
 */

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

/* ── Google polyline encoder ── */

function encodePolyline(coords: [number, number][]): string {
  let encoded = "";

  let prevLat = 0;
  let prevLng = 0;

  for (const [lng, lat] of coords) {
    // Convert to 1e5 integers
    const latE5 = Math.round(lat * 1e5);
    const lngE5 = Math.round(lng * 1e5);

    encoded += encodeSignedValue(latE5 - prevLat);
    encoded += encodeSignedValue(lngE5 - prevLng);

    prevLat = latE5;
    prevLng = lngE5;
  }

  return encoded;
}

function encodeSignedValue(value: number): string {
  let v = value < 0 ? ~(value << 1) : value << 1;
  let encoded = "";

  while (v >= 0x20) {
    encoded += String.fromCharCode((0x20 | (v & 0x1f)) + 63);
    v >>= 5;
  }
  encoded += String.fromCharCode(v + 63);

  return encoded;
}

/* ── Public API ── */

/**
 * Look up coordinates for a list of city names.
 * Unknown cities are silently skipped.
 */
function getTripRouteCoords(cities: string[]): [number, number][] {
  const coords: [number, number][] = [];

  for (const city of cities) {
    const c = CITY_COORDS[city];
    if (c) coords.push(c);
  }

  return coords;
}

/**
 * Generate a Mapbox Static Images API URL showing a route line
 * through the given cities.
 *
 * Returns `null` when:
 * - The Mapbox token is missing / empty
 * - Fewer than 2 cities resolve to coordinates
 */
export function getStaticMapUrl(
  cities: string[],
  options?: {
    width?: number;
    height?: number;
    style?: string;
    lineColor?: string;
  },
): string | null {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.replace(/^["']|["']$/g, "");
  if (!token) return null;

  const coords = getTripRouteCoords(cities);
  if (coords.length < 2) return null;

  const {
    width = 800,
    height = 300,
    style = "outdoors-v12",
    lineColor = "2B6CE6",
  } = options ?? {};

  const polyline = encodePolyline(coords);
  const encodedPolyline = encodeURIComponent(polyline);

  // Mapbox path overlay format:
  // path-{strokeWidth}+{strokeColor}-{strokeOpacity}({encodedPolyline})
  const overlay = `path-3+${lineColor}-0.7(${encodedPolyline})`;

  return (
    `https://api.mapbox.com/styles/v1/mapbox/${style}/static/` +
    `${overlay}/auto/${width}x${height}@2x` +
    `?access_token=${token}&padding=40`
  );
}
