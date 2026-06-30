import { notFound } from "next/navigation";
import {
  getTripBySlug,
  getVisibleTrips,
  getDaysForTrip,
  getPlacesForDay,
  buildPreview,
} from "@/lib/trips";
import type { Place } from "@/types";
import TripDetailContent from "@/app/trips/[slug]/TripDetailContent";
import ComingSoonContent from "@/app/trips/[slug]/ComingSoonContent";
import EmbedTripWrapper from "./EmbedTripWrapper";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const trips = await getVisibleTrips();
  return trips.map((t) => ({ slug: t.slug }));
}

export default async function EmbedTripDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  if (!trip) notFound();

  if (trip.status === "coming_soon") {
    return (
      <EmbedTripWrapper>
        <ComingSoonContent trip={trip} />
      </EmbedTripWrapper>
    );
  }

  const fullDays = await getDaysForTrip(trip.id);
  const fullDayPlaces: Record<string, Place[]> = {};
  for (const day of fullDays) {
    fullDayPlaces[day.id] = await getPlacesForDay(trip.id, day.id);
  }

  const gateEnforced = process.env.NEXT_PUBLIC_ENABLE_LOGIN_GATE !== "false";
  const { days, dayPlaces } = gateEnforced
    ? buildPreview(fullDays, fullDayPlaces)
    : { days: fullDays, dayPlaces: fullDayPlaces };

  return (
    <EmbedTripWrapper>
      <TripDetailContent
        trip={trip}
        days={days}
        dayPlaces={dayPlaces}
        gateEnforced={gateEnforced}
      />
    </EmbedTripWrapper>
  );
}
