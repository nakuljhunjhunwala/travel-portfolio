import type { Metadata } from "next";
import { getVisibleTrips } from "@/lib/trips";
import { absoluteUrl, SITE_URL } from "@/lib/site";
import TripGrid from "@/components/trip/TripGrid";

export const metadata: Metadata = {
  title: "All Trips",
  description:
    "Every trip across India — honest, day-by-day itineraries with real costs, real stays, and the parts worth skipping.",
  alternates: { canonical: "/trips" },
  openGraph: {
    title: "All Trips Across India | Nakul's Travels",
    description:
      "Honest, day-by-day travel itineraries across India with real costs and real stays.",
    url: absoluteUrl("/trips"),
    type: "website",
  },
};

export default async function TripsHubPage() {
  const trips = await getVisibleTrips();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Trips", item: absoluteUrl("/trips") },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/trips#list`,
        name: "Trips Across India",
        numberOfItems: trips.length,
        itemListElement: trips.map((trip, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: absoluteUrl(`/trips/${trip.slug}`),
          name: trip.title,
        })),
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="mb-8 max-w-2xl">
        <p className="font-heading text-xs font-semibold uppercase tracking-wide text-primary-text">
          The collection
        </p>
        <h1 className="mt-2 font-heading text-3xl font-bold leading-tight text-heading sm:text-4xl">
          Trips Across India
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Real itineraries from real trips — day-by-day plans, honest costs, the stays
          that were worth it, and the things I&rsquo;d skip next time.
        </p>
      </header>

      <TripGrid trips={trips} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}
