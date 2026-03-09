"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Place } from "@/types";
import { useAuth } from "@/lib/auth-context";
import { usePlaceDetails } from "@/hooks/usePlaceDetails";
import { getPlacePhotoUrl } from "@/lib/photos";
import HonestNote from "./HonestNote";

interface PlaceCardProps {
  place: Place;
  placeCity: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill={star <= rating ? "var(--color-primary)" : "none"}
          stroke={star <= rating ? "var(--color-primary)" : "#D1D5DB"}
          strokeWidth="2"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function WouldReturnBadge({ value }: { value: "yes" | "no" | "maybe" }) {
  const config = {
    yes: { label: "Would return", color: "text-emerald-600", icon: "✓" },
    no: { label: "Skip it", color: "text-red-500", icon: "✗" },
    maybe: { label: "Maybe", color: "text-amber-600", icon: "~" },
  }[value];

  return (
    <span className={`inline-flex items-center gap-0.5 ${config.color} text-[10px] md:text-xs font-medium`}>
      <span className="font-mono font-bold">{config.icon}</span>
      {config.label}
    </span>
  );
}

const LOGIN_GATE_ENABLED =
  process.env.NEXT_PUBLIC_ENABLE_LOGIN_GATE !== "false";

export default function PlaceCard({ place, placeCity }: PlaceCardProps) {
  const { user } = useAuth();
  const isLoggedIn = !!user || !LOGIN_GATE_ENABLED;
  const hasExtras = place.yourRating || place.wouldReturn || place.actualCost;
  const hasHonestData = place.honestNote && hasExtras;

  const { details, loading } = usePlaceDetails(
    place.googlePlaceId,
    place.name,
    placeCity
  );

  const [photoError, setPhotoError] = useState(false);

  // Photo: prefer details photo, fall back to place photo (unless it's a placeholder SVG), then curated Unsplash
  const photoSrc = photoError
    ? getPlacePhotoUrl(place.name)
    : details?.photoUrl ||
      (place.photoUrl.startsWith("/images/")
        ? getPlacePhotoUrl(place.name)
        : place.photoUrl);

  // Description text: prefer enriched data
  const description =
    details?.geminiSummary || details?.editorialSummary || null;

  // Opening hours: prefer enriched data
  const openingHours =
    details?.openingHours && details.openingHours.length > 0
      ? details.openingHours[0]
      : place.openingHours;

  // Primary type label for Google rating row
  const primaryType =
    details?.types && details.types.length > 0
      ? details.types[0].replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : null;

  // Place name element — link to Google Maps if available
  const placeName = details?.googleMapsUri ? (
    <a
      href={details.googleMapsUri}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:underline decoration-primary/30 underline-offset-2"
    >
      {place.name}
    </a>
  ) : (
    place.name
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="rounded-2xl bg-[var(--color-travel-row)] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow duration-200"
    >
      {/* Main card body */}
      <div className="p-4 md:p-5">
        {/* Top row: Pin + Name + Photo thumbnail */}
        <div className="flex gap-3">
          {/* Content side — all text flows here beside the photo */}
          <div className="flex-1 min-w-0">
            {/* Pin + Name */}
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-pin-bg text-pin-text text-xs md:text-sm font-semibold flex items-center justify-center flex-shrink-0 shadow-sm">
                {place.index}
              </span>
              <div className="min-w-0">
                <h3 className="font-heading font-bold text-heading text-sm md:text-base leading-snug">
                  {placeName}
                </h3>
                {details?.formattedAddress && (
                  <p className="font-body text-[11px] md:text-xs text-muted truncate mt-0.5">
                    {details.formattedAddress}
                  </p>
                )}
              </div>
            </div>

            {/* Google rating row */}
            {details?.rating && (
              <p className="font-body text-[11px] md:text-xs text-muted mt-1.5 ml-[38px] md:ml-[42px] flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-0.5">
                  <span>⭐</span>
                  <span className="font-mono font-medium">{details.rating.toFixed(1)}</span>
                </span>
                {details.userRatingCount != null && (
                  <span>({details.userRatingCount.toLocaleString("en-IN")} reviews)</span>
                )}
                {primaryType && (
                  <>
                    <span className="text-muted/40">—</span>
                    <span>{primaryType}</span>
                  </>
                )}
              </p>
            )}

            {/* Description: hours + summary — flows beside photo */}
            {loading ? (
              <div className="mt-2 space-y-1.5 ml-[38px] md:ml-[42px]">
                <div className="h-3 w-3/4 rounded animate-pulse bg-gray-200/50" />
                <div className="h-3 w-1/2 rounded animate-pulse bg-gray-200/50" />
              </div>
            ) : (
              (openingHours || description) && (
                <p className="font-body text-[13px] md:text-sm text-body leading-relaxed line-clamp-3 mt-2 ml-[38px] md:ml-[42px]">
                  {openingHours && <span className="text-muted">{openingHours}</span>}
                  {description && (
                    <>
                      {openingHours && <span className="text-muted"> &bull; </span>}
                      {description}
                    </>
                  )}
                </p>
              )
            )}

            {/* Time pill */}
            <div className="mt-2 ml-[38px] md:ml-[42px]">
              <span className="inline-flex items-center bg-primary-soft text-primary-text rounded-md px-2.5 py-1 text-[11px] md:text-xs font-mono font-medium">
                {place.visitStart} - {place.visitEnd}
              </span>
            </div>
          </div>

          {/* Photo — square thumbnail, top-right */}
          <div className="w-[90px] h-[90px] md:w-[120px] md:h-[120px] rounded-xl overflow-hidden relative flex-shrink-0 self-start">
            {loading ? (
              <div className="absolute inset-0 animate-pulse bg-gray-200/50 rounded-xl" />
            ) : (
              <Image
                src={photoSrc}
                alt={place.name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 90px, 120px"
                onError={() => setPhotoError(true)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Logged in + has honest note data: show full HonestNote */}
      {isLoggedIn && hasHonestData && place.yourRating && place.wouldReturn && (
        <div className="px-4 md:px-5 py-3 border-t border-black/[0.04]">
          <HonestNote
            yourRating={place.yourRating}
            actualCost={place.actualCost}
            wouldReturn={place.wouldReturn}
            honestNote={place.honestNote!}
          />
        </div>
      )}

      {/* Not logged in or no honest note: show basic extras row as teaser */}
      {(!isLoggedIn || !hasHonestData) && hasExtras && (
        <div className="flex items-center gap-3 px-4 md:px-5 py-2 border-t border-black/[0.04]">
          {place.yourRating && <StarRating rating={place.yourRating} />}
          {place.wouldReturn && <WouldReturnBadge value={place.wouldReturn} />}
          {place.actualCost && (
            <span className="font-mono text-[10px] md:text-xs text-muted">
              {place.actualCost}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
