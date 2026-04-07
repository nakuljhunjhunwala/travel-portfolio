import { getVisibleTrips } from "@/lib/trips";
import EmbedMapContent from "./EmbedMapContent";

export default async function EmbedMapPage() {
  const trips = await getVisibleTrips();
  return <EmbedMapContent trips={trips} />;
}
