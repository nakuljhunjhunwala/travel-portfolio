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
  googlePlaceId: string;
  openingHours: string;
  visitStart: string;
  visitEnd: string;
  photoUrl: string;
  blurHash?: string;
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

export interface GeminiPlaceCache {
  name: string;
  geminiSummary: string;
  cachedAt: Timestamp;
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
  totalTimeSeconds: number;
}
