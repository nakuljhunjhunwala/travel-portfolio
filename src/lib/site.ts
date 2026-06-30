/**
 * Canonical site URL helpers. JSON-LD requires ABSOLUTE URLs, so structured data
 * across the homepage, /trips hub, and trip pages all build links through here.
 *
 * In production set NEXT_PUBLIC_BASE_URL=https://travel.nakuljhunjhunwala.in —
 * otherwise everything falls back to localhost and canonicals/indexing break.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
).replace(/\/$/, "");

/** Join a path onto the canonical site origin, returning an absolute URL. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
