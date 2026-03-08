import type { MetadataRoute } from "next";
import { getPublishedTrips } from "@/lib/trips";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const trips = await getPublishedTrips();
  const tripEntries: MetadataRoute.Sitemap = trips.map((trip) => ({
    url: `${baseUrl}/trips/${trip.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/trips`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...tripEntries,
  ];
}
