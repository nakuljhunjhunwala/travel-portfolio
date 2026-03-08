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
  tripTheme: string;
  tripDNA: { nature: number; food: number; culture: number };
  bestMoment: string;
  skipThis: string;
  bestMonth: string;
  hookLine: string;
  travelMode: string[];
  tripType: "solo" | "couple" | "group";
}

export interface Day {
  id: string;
  dayNumber: number;
  date: Timestamp;
  city: string;
  dayTitle: string;
  totalDuration: string;
  totalDistance: string;
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
}

export interface TravelConnector {
  mode: "walk" | "drive" | "auto" | "train" | "bus";
  duration: string;
  distance: string;
  directionsUrl: string;
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
