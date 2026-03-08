import { ImageResponse } from "next/og";
import { getTripBySlug } from "@/lib/trips";

export const alt = "Trip cover image";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);

  if (!trip) {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#1a1a2e",
            color: "white",
            fontSize: 36,
          }}
        >
          Trip not found
        </div>
      ),
      { ...size },
    );
  }

  const subtitle = `${trip.states.join(", ")} · ${trip.cities.length} cities`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          width: "100%",
          height: "100%",
          backgroundColor: "#0f3460",
          padding: 48,
        }}
      >
        <div style={{ display: "flex", fontSize: 24, color: "rgba(255,255,255,0.7)" }}>
          {subtitle}
        </div>
        <div style={{ display: "flex", fontSize: 56, fontWeight: 700, color: "white", marginTop: 12 }}>
          {trip.title}
        </div>
        <div style={{ display: "flex", fontSize: 24, color: "rgba(255,255,255,0.6)", fontStyle: "italic", marginTop: 12 }}>
          {trip.hookLine}
        </div>
        <div style={{ display: "flex", fontSize: 18, color: "rgba(255,255,255,0.5)", marginTop: 24 }}>
          {"Nakul\u2019s Travels"}
        </div>
      </div>
    ),
    { ...size },
  );
}
