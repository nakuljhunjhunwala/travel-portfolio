import { notFound } from "next/navigation";
import {
  getTripBySlug,
  getVisibleTrips,
  getDaysForTrip,
  getPlacesForDay,
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

  const days = await getDaysForTrip(trip.id);
  const dayPlaces: Record<string, Place[]> = {};
  for (const day of days) {
    dayPlaces[day.id] = await getPlacesForDay(trip.id, day.id);
  }

  return (
    <EmbedTripWrapper>
      <TripDetailContent trip={trip} days={days} dayPlaces={dayPlaces} />
    </EmbedTripWrapper>
  );
}
