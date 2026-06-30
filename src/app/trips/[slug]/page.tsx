import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTripBySlug, getVisibleTrips, getDaysForTrip, getPlacesForDay, getTripReaderCount, buildPreview } from "@/lib/trips";
import { OWNER, SAME_AS } from "@/lib/constants";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import TripDetailContent from "./TripDetailContent";
import ComingSoonContent from "./ComingSoonContent";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  if (!trip) return { title: "Trip Not Found" };

  return {
    title: trip.title,
    description: `${trip.hookLine} — ${trip.cities.join(", ")} | ${trip.states.join(", ")}`,
    openGraph: {
      title: trip.title,
      description: trip.hookLine,
      images: [{ url: trip.coverPhoto }],
    },
    alternates: {
      canonical: `/trips/${trip.slug}`,
    },
  };
}

export async function generateStaticParams() {
  const trips = await getVisibleTrips();
  return trips.map((t) => ({ slug: t.slug }));
}

export default async function TripDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  if (!trip) notFound();

  // Coming soon trips get a dedicated lightweight page
  if (trip.status === "coming_soon") {
    return <ComingSoonContent trip={trip} />;
  }

  const fullDays = await getDaysForTrip(trip.id);

  // Build places map keyed by day.id
  const fullDayPlaces: Record<string, import("@/types").Place[]> = {};
  for (const day of fullDays) {
    fullDayPlaces[day.id] = await getPlacesForDay(trip.id, day.id);
  }

  // Real gate: when enabled, embed ONLY the free preview in the static HTML.
  // The full itinerary is fetched client-side via /api/itinerary after sign-in.
  // When disabled (NEXT_PUBLIC_ENABLE_LOGIN_GATE=false), embed everything (public).
  const gateEnforced = process.env.NEXT_PUBLIC_ENABLE_LOGIN_GATE !== "false";
  const { days, dayPlaces } = gateEnforced
    ? buildPreview(fullDays, fullDayPlaces)
    : { days: fullDays, dayPlaces: fullDayPlaces };

  // When gated, strip the premium Essentials fields (driver phone, costs, tips)
  // from the embedded trip — they're restored client-side via /api/itinerary.
  const clientTrip = gateEnforced
    ? { ...trip, transport: undefined, costBreakdown: undefined, tips: undefined }
    : trip;

  const readerCount = await getTripReaderCount(trip.slug);

  const startDate = new Date(trip.startDate.seconds * 1000).toISOString().split("T")[0];
  const endDate = new Date(trip.endDate.seconds * 1000).toISOString().split("T")[0];

  const tripUrl = absoluteUrl(`/trips/${trip.slug}`);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Trips", item: absoluteUrl("/trips") },
          { "@type": "ListItem", position: 3, name: trip.title, item: tripUrl },
        ],
      },
      {
        "@type": "TouristTrip",
        "@id": `${tripUrl}#trip`,
        name: trip.title,
        description: `${trip.hookLine} — ${trip.cities.join(", ")} | ${trip.states.join(", ")}`,
        url: tripUrl,
        image: absoluteUrl(trip.coverPhoto),
        startDate,
        endDate,
        touristType: trip.tripType,
        author: {
          "@type": "Person",
          "@id": `${SITE_URL}/#person`,
          name: OWNER.name,
          url: `${SITE_URL}/`,
          sameAs: SAME_AS,
        },
        itinerary: {
          "@type": "ItemList",
          numberOfItems: trip.cities.length,
          itemListElement: trip.cities.map((city, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: city,
          })),
        },
      },
    ],
  };

  return (
    <>
      <TripDetailContent
        trip={clientTrip}
        days={days}
        dayPlaces={dayPlaces}
        readerCount={readerCount}
        gateEnforced={gateEnforced}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
