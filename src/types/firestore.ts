import { Timestamp } from "firebase/firestore";

export interface Trip {
  id: string;
  title: string;
  slug: string;
  coverPhoto: string;
  blurHash?: string;
  states: string[];
  cities: string[];
  startDate: Timestamp;
  endDate: Timestamp;
  tags: string[];
  budgetTier: "₹" | "₹₹" | "₹₹₹";
  totalCost: number;
  published: boolean;
  status?: "published" | "coming_soon" | "draft";
  tripTheme: string;
  tripDNA: { nature: number; food: number; culture: number };
  bestMoment: string;
  skipThis: string;
  bestMonth: string;
  hookLine: string;
  travelMode: string[];
  tripType: "solo" | "couple" | "group";
  visitedHighlight?: string;
  visitedDate?: string;
  /** Trip-wide essentials (optional) — powers the "Trip Essentials" section. */
  transport?: TripTransport;
  costBreakdown?: TripCostBreakdown;
  tips?: string[];
}

/** How you got there and got around — shown in Trip Essentials → "Getting around". */
export interface TripTransport {
  summary?: string;
  trainIn?: string;
  trainOut?: string;
  cabVehicle?: string;
  cabDriverName?: string;
  cabDriverPhone?: string;
  cabPackage?: string;
  cabInclusions?: string;
  cabTerms?: string;
}

/** Real cost breakdown — shown in Trip Essentials → "What it cost". */
export interface TripCostBreakdown {
  /** Per-person figure (matches the headline). */
  perPerson?: number;
  /** Full group spend. */
  groupTotal?: number;
  travellers?: number;
  /** Category rows, e.g. { label: "Stays", amount: 32750 }. */
  items?: { label: string; amount: number }[];
  /** Context note (e.g. how it was split / what's excluded). */
  note?: string;
}

export interface Accommodation {
  name: string;
  phoneNumber?: string;
  googleMapsUrl?: string;
  costPerNight?: string;
  totalCost?: string;
  checkIn?: string;
  checkOut?: string;
  bookingUrl?: string;
  rating?: number;
  honestNote?: string;
  photoUrl?: string;
  /** Optional coordinates for an optional stay marker on the trip map. */
  lat?: number;
  lng?: number;
}

export interface Day {
  id: string;
  dayNumber: number;
  date: Timestamp;
  city: string;
  dayTitle: string;
  totalDuration: string;
  totalDistance: string;
  accommodation?: Accommodation;
}

export interface Place {
  id: string;
  index: number;
  name: string;
  /** Coordinates for the trip map — researched and stored inline at authoring time.
   *  Optional: transit/travel-day entries (trains, drives) may have no map point. */
  lat?: number;
  lng?: number;
  /** Optional Google place id, used only to build a Maps deep-link when no googleMapsUrl is set. */
  googlePlaceId?: string;
  openingHours: string;
  visitStart: string;
  visitEnd: string;
  photoUrl: string;
  blurHash?: string;
  /** Self-contained, hand-researched place details (no runtime API enrichment). */
  description?: string;
  address?: string;
  rating?: number;
  ratingCount?: number;
  yourRating?: number;
  actualCost?: string;
  wouldReturn?: "yes" | "no" | "maybe";
  honestNote?: string;
  travelToNext?: TravelConnector;
  phoneNumber?: string;
  websiteUrl?: string;
  googleMapsUrl?: string;
  placeCategory?: "attraction" | "restaurant" | "cafe" | "hotel" | "market" | "temple" | "beach" | "trek" | "transport";
}

export interface TravelConnector {
  mode: "walk" | "drive" | "auto" | "train" | "bus";
  duration: string;
  distance: string;
  directionsUrl: string;
  contactName?: string;
  contactPhone?: string;
  note?: string;
  costEstimate?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  photoUrl: string;
  createdAt: Timestamp;
  lastLoginAt?: Timestamp;
}

export interface TripViewAnalytics {
  viewedAt: Timestamp;
  lastViewedAt: Timestamp;
  viewCount: number;
  daysUnlocked: number[];
}
