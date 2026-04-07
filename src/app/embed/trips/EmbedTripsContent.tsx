"use client";

import { Suspense, useEffect } from "react";
import { motion } from "framer-motion";
import type { Trip } from "@/types";
import TripCard from "@/components/trip/TripCard";
import { useEmbedTheme } from "@/hooks/useEmbedTheme";
import { sendToParent } from "@/lib/embed-messenger";

interface EmbedTripsContentProps {
  trips: Trip[];
}

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

function EmbedTripsInner({ trips }: EmbedTripsContentProps) {
  useEmbedTheme();

  useEffect(() => {
    sendToParent({ type: "TRAVEL_EMBED_READY" });
  }, []);

  const published = trips.filter((t) => t.status === "published");
  const comingSoon = trips.filter((t) => t.status === "coming_soon");
  const all = [...published, ...comingSoon];

  if (all.length === 0) {
    return (
      <p className="text-muted text-sm text-center py-12">
        No trips yet. Stay tuned!
      </p>
    );
  }

  return (
    <div className="p-3 overflow-y-auto" style={{ maxHeight: "100vh" }}>
      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {all.map((trip) => (
          <motion.div key={trip.id} variants={cardVariants}>
            <TripCard trip={trip} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

export default function EmbedTripsContent({ trips }: EmbedTripsContentProps) {
  return (
    <Suspense>
      <EmbedTripsInner trips={trips} />
    </Suspense>
  );
}
