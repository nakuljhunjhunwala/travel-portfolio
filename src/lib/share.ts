import type { Trip, Day, Place } from "@/types";

/**
 * Build a share URL for a trip, optionally anchored to a specific day.
 */
export function generateShareUrl(
  baseUrl: string,
  tripSlug: string,
  dayNumber?: number
): string {
  const base = baseUrl.replace(/\/$/, "");
  const path = `${base}/trips/${tripSlug}`;
  return dayNumber !== undefined ? `${path}#day-${dayNumber}` : path;
}

/**
 * Format a place entry for shareable text.
 * Returns an array of lines (without trailing newlines).
 */
function formatPlaceLines(place: Place, index: number): string[] {
  const lines: string[] = [];

  const timeRange =
    place.visitStart && place.visitEnd
      ? `${place.visitStart}–${place.visitEnd}`
      : place.visitStart || place.visitEnd || "";

  const costPart = place.actualCost ? ` - Rs.${place.actualCost}` : "";
  const timePart = timeRange ? ` - ${timeRange}` : "";

  lines.push(`${index}. ${place.name}${timePart}${costPart}`);

  if (place.googleMapsUrl) {
    lines.push(`   Maps: ${place.googleMapsUrl}`);
  } else if (place.googlePlaceId) {
    lines.push(
      `   Maps: https://www.google.com/maps/place/?q=place_id:${place.googlePlaceId}`
    );
  }

  if (place.phoneNumber) {
    lines.push(`   Phone: ${place.phoneNumber}`);
  }

  return lines;
}

/**
 * Format a single day section for shareable text.
 */
function formatDaySection(day: Day, places: Place[]): string[] {
  const lines: string[] = [];

  lines.push(`Day ${day.dayNumber}: ${day.dayTitle} (${day.city})`);

  places.forEach((place, i) => {
    formatPlaceLines(place, i + 1).forEach((l) => lines.push(l));
  });

  if (day.accommodation) {
    const acc = day.accommodation;
    const costPart = acc.costPerNight ? ` - Rs.${acc.costPerNight}/night` : "";
    lines.push(`Stay: ${acc.name}${costPart}`);
    if (acc.phoneNumber) {
      lines.push(`   Phone: ${acc.phoneNumber}`);
    }
    if (acc.googleMapsUrl) {
      lines.push(`   Maps: ${acc.googleMapsUrl}`);
    }
  }

  return lines;
}

/**
 * Generate the full itinerary as shareable plain text.
 */
export function generateItineraryText(
  trip: Trip,
  days: Day[],
  dayPlaces: Record<string, Place[]>,
  baseUrl: string
): string {
  const dayCount = days.length;
  const citiesLine =
    trip.cities.length > 0 ? trip.cities.join(" > ") : trip.states.join(", ");
  const totalCost = `Total: Rs.${trip.totalCost.toLocaleString("en-IN")}`;
  const shareUrl = generateShareUrl(baseUrl, trip.slug);

  const lines: string[] = [
    `${trip.title} (${dayCount} ${dayCount === 1 ? "Day" : "Days"})`,
    citiesLine,
    totalCost,
    "",
  ];

  days.forEach((day, i) => {
    const places = dayPlaces[day.id] ?? [];
    const dayLines = formatDaySection(day, places);
    dayLines.forEach((l) => lines.push(l));
    if (i < days.length - 1) lines.push("");
  });

  lines.push("");
  lines.push(`Full itinerary: ${shareUrl}`);

  return lines.join("\n");
}

/**
 * Generate a single day as shareable plain text, with a deep-link anchor.
 */
export function generateDayText(
  trip: Trip,
  day: Day,
  places: Place[],
  baseUrl: string
): string {
  const shareUrl = generateShareUrl(baseUrl, trip.slug, day.dayNumber);

  const lines: string[] = [
    `${trip.title}`,
    `Day ${day.dayNumber}: ${day.dayTitle} (${day.city})`,
    "",
  ];

  places.forEach((place, i) => {
    formatPlaceLines(place, i + 1).forEach((l) => lines.push(l));
  });

  if (day.accommodation) {
    const acc = day.accommodation;
    const costPart = acc.costPerNight ? ` - Rs.${acc.costPerNight}/night` : "";
    lines.push(`Stay: ${acc.name}${costPart}`);
    if (acc.phoneNumber) {
      lines.push(`   Phone: ${acc.phoneNumber}`);
    }
    if (acc.googleMapsUrl) {
      lines.push(`   Maps: ${acc.googleMapsUrl}`);
    }
  }

  lines.push("");
  lines.push(`Full itinerary: ${shareUrl}`);

  return lines.join("\n");
}
