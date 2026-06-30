import { ImageResponse } from "next/og";
import { getVisibleTrips } from "@/lib/trips";
import { OWNER } from "@/lib/constants";

export const alt = "Nakul's Travels — honest, day-by-day India itineraries";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Compass Pin mark (white pin + blue needle) as an inline SVG data URI.
const PIN_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 40'><path d='M16 1.5C8.82 1.5 3 7.32 3 14.5c0 9.75 13 23 13 23s13-13.25 13-23c0-7.18-5.82-13-13-13Z' fill='#ffffff'/><polygon points='16,6.5 20.5,15 11.5,15' fill='#1A56DB'/><polygon points='16,23.5 20.5,15 11.5,15' fill='#9BC0FF'/><circle cx='16' cy='15' r='2.1' fill='#1A56DB'/></svg>`;
const PIN_DATA = `data:image/svg+xml;utf8,${encodeURIComponent(PIN_SVG)}`;

export default async function Image() {
  const trips = await getVisibleTrips();
  const states = new Set<string>();
  const cities = new Set<string>();
  for (const t of trips) {
    t.states.forEach((s) => states.add(s));
    t.cities.forEach((c) => cities.add(c));
  }

  const stats = [
    `${states.size} states`,
    `${cities.size}+ cities`,
    "real costs",
  ];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 72,
          backgroundColor: "#2B6CE6",
          backgroundImage:
            "linear-gradient(135deg, #2B6CE6 0%, #1A56DB 60%, #103FB0 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <img src={PIN_DATA} width={84} height={105} alt="" />
          <div style={{ display: "flex", fontSize: 44, fontWeight: 700 }}>
            {OWNER.siteName}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, lineHeight: 1.05 }}>
            Honest itineraries
          </div>
          <div style={{ display: "flex", fontSize: 68, fontWeight: 700, lineHeight: 1.05, color: "rgba(255,255,255,0.85)" }}>
            across India.
          </div>
          <div style={{ display: "flex", fontSize: 30, color: "rgba(255,255,255,0.8)", marginTop: 8 }}>
            Real costs · real stays · the stuff worth skipping.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {stats.map((s) => (
            <div
              key={s}
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 600,
                padding: "10px 22px",
                borderRadius: 999,
                backgroundColor: "rgba(255,255,255,0.16)",
                border: "1px solid rgba(255,255,255,0.28)",
              }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
