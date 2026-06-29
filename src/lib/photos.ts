/**
 * Curated, no-network fallback photos.
 *
 * Place photos are researched and stored inline on each Place (`photoUrl`). This module
 * only provides a graceful fallback (curated Unsplash, public, no API key) for places that
 * have no stored photo or whose photo fails to load.
 */

const CURATED_PHOTOS: Record<string, string> = {
  // --- Rajasthan ---
  "Hawa Mahal":
    "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&h=400&fit=crop",
  "City Palace":
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&h=400&fit=crop",
  "Jantar Mantar":
    "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&h=400&fit=crop",
  "LMB (Laxmi Mishthan Bhandar)":
    "https://images.unsplash.com/photo-1567337710282-00832b415979?w=600&h=400&fit=crop",
  "Amber Fort":
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&h=400&fit=crop",
  "Jaigarh Fort":
    "https://images.unsplash.com/photo-1548013146-72479768bada?w=600&h=400&fit=crop",
  "Johari Bazaar":
    "https://images.unsplash.com/photo-1567337710282-00832b415979?w=600&h=400&fit=crop",

  // --- Himachal ---
  "Old Manali":
    "https://images.unsplash.com/photo-1593181629936-11c609b8db9b?w=600&h=400&fit=crop",
  "Hadimba Temple":
    "https://images.unsplash.com/photo-1626621331169-5f34be280ed9?w=600&h=400&fit=crop",
  "Kasol Village":
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop",
  "Chalal Village":
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&h=400&fit=crop",

  // --- Kerala ---
  "Chinese Fishing Nets":
    "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?w=600&h=400&fit=crop",
  "Fort Kochi Beach":
    "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&h=400&fit=crop",
  "Kashi Art Cafe":
    "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600&h=400&fit=crop",
};

/** Generic travel/landscape fallback photo */
const FALLBACK_PHOTO =
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop";

/**
 * Returns a curated Unsplash photo URL for a known place, or a generic
 * travel photo as a fallback.
 *
 * All URLs are public — no API key required.
 */
export function getPlacePhotoUrl(placeName: string): string {
  // Exact match first
  if (CURATED_PHOTOS[placeName]) {
    return CURATED_PHOTOS[placeName];
  }

  // Case-insensitive / partial match (e.g. "city palace" matches "City Palace")
  const lowerName = placeName.toLowerCase();
  for (const [key, url] of Object.entries(CURATED_PHOTOS)) {
    if (key.toLowerCase() === lowerName || key.toLowerCase().includes(lowerName)) {
      return url;
    }
  }

  // Fallback: generic travel landscape
  return FALLBACK_PHOTO;
}
