import { getVisibleTrips } from "@/lib/trips";
import EmbedTripsContent from "./EmbedTripsContent";

export default async function EmbedTripsPage() {
  const trips = await getVisibleTrips();
  return <EmbedTripsContent trips={trips} />;
}
