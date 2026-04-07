"use client";

import { useEffect } from "react";
import { sendToParent } from "@/lib/embed-messenger";

/**
 * Intercepts link clicks within embed views.
 * - Trip links (/trips/[slug]) → send postMessage to parent + open in new tab
 * - Other internal links → open in new tab
 * - External links → open in new tab
 */
export default function EmbedLinkInterceptor({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Intercept trip detail links
      const tripMatch = href.match(/^\/trips\/(.+)/);
      if (tripMatch) {
        e.preventDefault();
        e.stopPropagation();
        const slug = tripMatch[1];
        sendToParent({
          type: "TRAVEL_TRIP_CLICKED",
          slug,
          title: anchor.textContent || slug,
        });
        // Also open in new tab as fallback
        window.open(
          `https://travel.nakuljhunjhunwala.in/trips/${slug}`,
          "_blank"
        );
        return;
      }

      // All other links open in new tab
      if (href.startsWith("/") || href.startsWith(window.location.origin)) {
        e.preventDefault();
        window.open(
          href.startsWith("/")
            ? `https://travel.nakuljhunjhunwala.in${href}`
            : href,
          "_blank"
        );
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return <>{children}</>;
}
