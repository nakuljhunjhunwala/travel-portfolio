"use client";

import { createContext, useContext } from "react";
import type { TrackEvent } from "@/lib/analytics";

/**
 * Lets any descendant of a trip page log an engagement event
 * (essentials / map / share / contact / copy) without prop-drilling
 * the trip slug + signed-in user. Provided by TripDetailContent.
 */
const TripTrackContext = createContext<(event: TrackEvent) => void>(() => {});

export const TripTrackProvider = TripTrackContext.Provider;
export const useTripTrack = () => useContext(TripTrackContext);
