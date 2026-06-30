import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getTripBySlug, getDaysForTrip, getPlacesForDay } from "@/lib/trips";
import type { Place } from "@/types";
import "@/lib/firebase-admin";

/**
 * Server-enforced gate: returns the full itinerary (days + places) ONLY to a
 * caller with a valid Firebase ID token. Logged-out callers get 401 — the full
 * data is never shipped to them, so the gate is real (not cosmetic).
 */
export async function POST(req: Request) {
  try {
    const { slug, idToken } = (await req.json()) as {
      slug?: string;
      idToken?: string;
    };
    if (!slug || !idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      await getAuth().verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const trip = await getTripBySlug(slug);
    if (!trip || trip.status !== "published") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const days = await getDaysForTrip(trip.id);
    const dayPlaces: Record<string, Place[]> = {};
    for (const day of days) {
      dayPlaces[day.id] = await getPlacesForDay(trip.id, day.id);
    }

    // Also return the gated Trip-Essentials fields (stripped from the static payload).
    const essentials = {
      transport: trip.transport ?? null,
      costBreakdown: trip.costBreakdown ?? null,
      tips: trip.tips ?? null,
    };

    return NextResponse.json({ days, dayPlaces, essentials });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
