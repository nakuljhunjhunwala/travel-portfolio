"use client";

import { cn } from "@/lib/utils";

interface PhotoPlaceholderProps {
  placeName: string;
  className?: string;
}

/**
 * Gradient placeholder shown when no photo is available for a place.
 * Uses the trip theme's primary color as the gradient base. Displays the
 * first letter of the place name, large and centered.
 */
export default function PhotoPlaceholder({
  placeName,
  className,
}: PhotoPlaceholderProps) {
  const initial = placeName.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-card",
        "bg-gradient-to-br from-primary/80 to-primary/40",
        className
      )}
    >
      <span className="select-none font-heading text-5xl font-bold text-white/70">
        {initial}
      </span>
    </div>
  );
}
