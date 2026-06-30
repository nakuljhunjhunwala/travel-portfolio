import { getVisibleTrips } from "@/lib/trips";
import { OWNER, SAME_AS } from "@/lib/constants";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import HomeContent from "@/components/HomeContent";

export default async function Home() {
  const recentTrips = await getVisibleTrips();

  const personId = `${SITE_URL}/#person`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: `${SITE_URL}/`,
        name: OWNER.siteName,
        description:
          "Honest travel itineraries with real costs and day-by-day guides across India.",
        inLanguage: "en-IN",
        publisher: { "@id": personId },
      },
      {
        "@type": "Person",
        "@id": personId,
        name: OWNER.name,
        alternateName: OWNER.siteName,
        url: `${SITE_URL}/`,
        image: absoluteUrl("/icons/icon-512.png"),
        description:
          "Travels across India and writes honest, day-by-day itineraries with real costs.",
        sameAs: SAME_AS,
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/#trips`,
        name: "Trips Across India",
        numberOfItems: recentTrips.length,
        itemListElement: recentTrips.map((trip, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: absoluteUrl(`/trips/${trip.slug}`),
          name: trip.title,
        })),
      },
    ],
  };

  return (
    <>
      <HomeContent trips={recentTrips} />

      {/* JSON-LD: WebSite + Person (logo/sameAs) + ItemList of trips */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
