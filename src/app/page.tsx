import { getPublishedTrips } from "@/lib/trips";
import { OWNER } from "@/lib/constants";
import HomeContent from "@/components/HomeContent";

export default async function Home() {
  const recentTrips = await getPublishedTrips();

  return (
    <>
      <HomeContent trips={recentTrips} />

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: OWNER.siteName,
            description:
              "Personal travel portfolio with honest itineraries across India",
          }),
        }}
      />
    </>
  );
}
