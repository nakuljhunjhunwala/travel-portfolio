"use client";

import { motion } from "framer-motion";
import type { Trip } from "@/types";
import TripCard from "./TripCard";

interface TripGridProps {
  trips: Trip[];
}

const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function TripGrid({ trips }: TripGridProps) {
  const publishedTrips = trips.filter((t) => t.status === "published");
  const comingSoonTrips = trips.filter((t) => t.status === "coming_soon");

  if (trips.length === 0) {
    return (
      <p className="text-muted text-sm text-center py-12">
        No trips here yet. Stay tuned!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Published trips — main grid */}
      {publishedTrips.length > 0 && (
        <motion.div
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {publishedTrips.map((trip) => (
            <motion.div key={trip.id} variants={cardVariants}>
              <TripCard trip={trip} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Coming soon trips — secondary section */}
      {comingSoonTrips.length > 0 && (
        <div>
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="font-heading text-base md:text-lg font-semibold text-heading mb-4 flex items-center gap-2"
          >
            More States Explored
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium font-body bg-amber-100 text-amber-700 border border-amber-200">
              Itineraries Coming Soon
            </span>
          </motion.h3>
          <motion.div
            variants={gridVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {comingSoonTrips.map((trip) => (
              <motion.div key={trip.id} variants={cardVariants}>
                <TripCard trip={trip} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
}
