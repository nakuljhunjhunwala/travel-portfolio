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
  if (trips.length === 0) {
    return (
      <p className="text-muted text-sm text-center py-12">
        No trips here yet. Stay tuned!
      </p>
    );
  }

  return (
    <motion.div
      variants={gridVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {trips.map((trip) => (
        <motion.div key={trip.id} variants={cardVariants}>
          <TripCard trip={trip} />
        </motion.div>
      ))}
    </motion.div>
  );
}
