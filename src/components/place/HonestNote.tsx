"use client";

import { motion } from "framer-motion";

interface HonestNoteProps {
  yourRating: number;
  actualCost?: string;
  wouldReturn: "yes" | "no" | "maybe";
  honestNote: string;
  authorName?: string;
}

function AnimatedStar({ index, filled }: { index: number; filled: boolean }) {
  return (
    <motion.svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? "#FBBF24" : "none"}
      stroke={filled ? "#FBBF24" : "#D1D5DB"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 400,
        damping: 15,
      }}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </motion.svg>
  );
}

function WouldReturnPill({ value }: { value: "yes" | "no" | "maybe" }) {
  const config = {
    yes: {
      label: "Would go back",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    no: {
      label: "Skip it",
      bg: "bg-red-50",
      text: "text-red-600",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ),
    },
    maybe: {
      label: "Maybe",
      bg: "bg-amber-50",
      text: "text-amber-700",
      icon: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      ),
    },
  }[value];

  return (
    <span
      className={`inline-flex items-center gap-1 ${config.bg} ${config.text} rounded-full px-2.5 py-0.5 text-xs font-medium`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

export default function HonestNote({
  yourRating,
  actualCost,
  wouldReturn,
  honestNote,
  authorName = "Nakul",
}: HonestNoteProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <div className="bg-primary-soft/20 rounded-xl p-4 border border-primary/10">
        {/* Header */}
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-shrink-0"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <h4 className="font-heading font-semibold text-sm text-heading">
            {authorName}&apos;s Take
          </h4>
        </div>

        {/* Meta row: stars, cost, would-return */}
        <div className="flex items-center gap-3 flex-wrap mt-2.5">
          {/* Star rating */}
          <div className="flex items-center gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <AnimatedStar key={i} index={i} filled={i < yourRating} />
            ))}
          </div>

          {actualCost && (
            <span className="font-mono text-xs text-muted">{actualCost}</span>
          )}

          <WouldReturnPill value={wouldReturn} />
        </div>

        {/* Honest note text */}
        <p className="mt-2.5 font-body text-sm text-body/80 leading-relaxed italic">
          {honestNote}
        </p>
      </div>
    </motion.div>
  );
}
