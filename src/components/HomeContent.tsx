"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Trip } from "@/types";
import type { MapViewMode } from "@/components/map/IndiaMap";
import IndiaMapWrapper from "@/components/map/IndiaMapWrapper";
import TripGrid from "@/components/trip/TripGrid";

interface HomeContentProps {
  trips: Trip[];
}

type IntroPhase = "overlay" | "story" | "title" | "map" | "ambient" | "complete";

// --- Animation variants ---
// Longer durations + gentler easings = cinematic feel, not rushed

const lineVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: "blur(4px)",
    transition: { duration: 0.6, ease: "easeIn" as const },
  },
};

const titleVariants = {
  hidden: { opacity: 0, scale: 0.9, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const subtitleVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: "easeOut" as const, delay: 0.4 },
  },
};

const mapRevealVariants = {
  hidden: { opacity: 0, scale: 1.5, filter: "blur(16px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 1.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const glowVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 0.5,
    scale: 1.1,
    transition: { duration: 2.0, ease: "easeOut" as const, delay: 0.4 },
  },
};

const statPillVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 8 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const scrollHintVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export default function HomeContent({ trips }: HomeContentProps) {
  // Start with null phase — nothing renders until we know if we should skip or play
  const [phase, setPhase] = useState<IntroPhase | null>(null);
  const [skipIntro, setSkipIntro] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [mapViewMode, setMapViewMode] = useState<MapViewMode>("full");

  const isMapZoomed = mapViewMode !== "full";

  // Compute stats from trips
  const stats = useMemo(() => {
    const allVisible = trips.filter((t) => t.status !== "draft");
    const totalStates = new Set(allVisible.flatMap((t) => t.states)).size;
    const totalCities = new Set(allVisible.flatMap((t) => t.cities)).size;
    const totalCost = allVisible.reduce((sum, t) => sum + t.totalCost, 0);
    return { totalStates, totalCities, totalCost };
  }, [trips]);

  const formatCost = (cost: number) => {
    if (cost >= 100000) return `₹${(cost / 100000).toFixed(1).replace(/\.0$/, "")}L`;
    if (cost >= 1000) return `₹${(cost / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    return `₹${cost}`;
  };

  // Decide on mount: skip intro or play it
  useEffect(() => {
    if (sessionStorage.getItem("intro-seen") === "true") {
      setSkipIntro(true);
      setPhase("complete");
    } else {
      sessionStorage.setItem("intro-seen", "true");
      setOverlayVisible(true);
      setPhase("overlay");
    }
  }, []);

  // Phase timeline — spaced out for proper build-up
  // Each act gets breathing room before the next begins
  // Runs once on mount; the timers only fire after the mount effect above
  // has already decided whether to skip or play
  useEffect(() => {
    if (skipIntro) return;
    const timers = [
      setTimeout(() => setPhase("story"), 100),      // t=0.1s — story stats begin (small delay for mount effect)
      setTimeout(() => setPhase("title"), 4000),     // t=4.0s — story exits, title enters
      setTimeout(() => setPhase("map"), 5200),       // t=5.2s — map zooms in from satellite
      setTimeout(() => setPhase("ambient"), 7000),   // t=7.0s — stat pills float in
      setTimeout(() => setPhase("complete"), 8500),  // t=8.5s — scroll hint, fully interactive
    ];
    return () => timers.forEach(clearTimeout);
  }, [skipIntro]);

  const handleSkip = () => {
    setPhase("complete");
    setSkipIntro(true);
    setOverlayVisible(false);
  };

  const phaseIndex = (p: IntroPhase | null) =>
    p === null ? -1 : ["overlay", "story", "title", "map", "ambient", "complete"].indexOf(p);
  const isAtLeast = (target: IntroPhase) => phaseIndex(phase) >= phaseIndex(target);

  // Don't render until we know whether to skip or play (prevents hydration mismatch)
  if (phase === null) {
    return (
      <section className="min-h-screen flex flex-col items-center justify-center px-4" />
    );
  }

  const storyLines = [
    { text: `${stats.totalStates} states.`, style: "font-mono text-primary text-base md:text-xl" },
    { text: `${stats.totalCities} cities.`, style: "font-mono text-primary text-base md:text-xl" },
    { text: `${formatCost(stats.totalCost)} spent.`, style: "font-mono text-primary text-base md:text-xl" },
    { text: "One honest story.", style: "font-heading text-heading text-xl md:text-3xl font-bold mt-2" },
  ];

  const statPills = [
    { label: `${stats.totalStates} states explored`, floatClass: "stat-pill-float", position: "top-0 left-0 md:-left-4" },
    { label: `${stats.totalCities}+ cities`, floatClass: "stat-pill-float-delay-1", position: "top-0 right-0 md:-right-4" },
    { label: `${formatCost(stats.totalCost)} total spend`, floatClass: "stat-pill-float-delay-2", position: "-bottom-2 left-1/2 -translate-x-1/2" },
  ];

  return (
    <>
      {/* ACT 0: Dark overlay — slow, cinematic fade like eyes opening */}
      <AnimatePresence>
        {overlayVisible && !skipIntro && (
          <motion.div
            className="fixed inset-0 z-50 bg-[#0F172A] pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 2.0, ease: [0.22, 1, 0.36, 1] as const }}
            onAnimationComplete={() => setOverlayVisible(false)}
          />
        )}
      </AnimatePresence>

      {/* Skip button — appears after 2s so it doesn't distract from the opening */}
      <AnimatePresence>
        {!isAtLeast("complete") && !skipIntro && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2.0, duration: 0.5 }}
            whileHover={{ opacity: 1 }}
            onClick={handleSkip}
            className="fixed bottom-6 right-6 z-50 text-muted text-xs font-body px-3 py-1.5 rounded-full bg-card/80 backdrop-blur-sm shadow-card cursor-pointer"
          >
            Skip intro
          </motion.button>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-3 sm:px-4 py-8 md:py-0 relative overflow-hidden">

        {/* ACT 1: Story Stats — one at a time, let each line breathe */}
        <AnimatePresence>
          {isAtLeast("story") && !isAtLeast("title") && !skipIntro && (
            <motion.div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.7,   // 0.7s between each line — slow reveal
                    delayChildren: 0.5,      // wait for overlay to partly clear
                  },
                },
                exit: {
                  transition: {
                    staggerChildren: 0.06,
                    staggerDirection: -1,    // exit in reverse order
                  },
                },
              }}
            >
              {storyLines.map((line, i) => (
                <motion.p key={i} variants={lineVariants} className={line.style}>
                  {line.text}
                </motion.p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ACT 2: Title + Subtitle — scale + blur zoom with authority */}
        <motion.div
          className="text-center mb-4 md:mb-8 relative z-10"
          animate={{ opacity: isMapZoomed ? 0 : 1, y: isMapZoomed ? -10 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.h1
            variants={titleVariants}
            initial={skipIntro ? "visible" : "hidden"}
            animate={isAtLeast("title") ? "visible" : "hidden"}
            className="font-heading text-2xl sm:text-3xl md:text-5xl font-bold text-heading px-2"
          >
            My Travels Across India
          </motion.h1>
          <motion.p
            variants={subtitleVariants}
            initial={skipIntro ? "visible" : "hidden"}
            animate={isAtLeast("title") ? "visible" : "hidden"}
            className="text-muted text-sm sm:text-base md:text-lg mt-2 md:mt-3 px-4"
          >
            Honest itineraries. Real costs. No influencer BS.
          </motion.p>
        </motion.div>

        {/* ACT 3: Map cinematic reveal — zoom from satellite */}
        <div className="w-full max-w-md md:max-w-lg mx-auto relative">
          {/* Radial glow behind map */}
          <motion.div
            variants={glowVariants}
            initial={skipIntro ? "visible" : "hidden"}
            animate={isAtLeast("map") ? "visible" : "hidden"}
            className="absolute inset-0 bg-[radial-gradient(circle,var(--color-primary-soft)_0%,transparent_70%)] pointer-events-none"
          />

          {/* Map with zoom-from-satellite — starts 1.5x scale, blurred, zooms to normal */}
          <motion.div
            variants={mapRevealVariants}
            initial={skipIntro ? "visible" : "hidden"}
            animate={isAtLeast("map") ? "visible" : "hidden"}
            className="relative"
          >
            <IndiaMapWrapper trips={trips} mapRevealed={isAtLeast("ambient")} onViewModeChange={setMapViewMode} />
          </motion.div>

          {/* ACT 4: Floating stat pills — staggered entrance with gentle float */}
          {statPills.map((pill, i) => (
            <motion.div
              key={pill.label}
              variants={statPillVariants}
              initial={skipIntro ? "visible" : "hidden"}
              animate={isAtLeast("ambient") && !isMapZoomed ? "visible" : "hidden"}
              transition={{
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94] as const,
                delay: skipIntro ? 0 : i * 0.2,
              }}
              className={`absolute ${pill.position} hidden md:block z-20`}
            >
              <div
                className={`${pill.floatClass} bg-card shadow-card rounded-full px-3 py-1.5 text-xs font-mono text-muted whitespace-nowrap`}
              >
                {pill.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mobile stat pills — below map */}
        <motion.div
          initial={skipIntro ? { opacity: 1 } : { opacity: 0 }}
          animate={isAtLeast("ambient") && !isMapZoomed ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="flex md:hidden flex-wrap justify-center gap-1.5 mt-3"
        >
          {statPills.map((pill) => (
            <div
              key={pill.label}
              className="bg-card shadow-card rounded-full px-2.5 py-1 text-[11px] font-mono text-muted"
            >
              {pill.label}
            </div>
          ))}
        </motion.div>

        {/* ACT 5: Scroll hint */}
        <motion.div
          variants={scrollHintVariants}
          initial={skipIntro ? "visible" : "hidden"}
          animate={isAtLeast("complete") && !isMapZoomed ? "visible" : "hidden"}
          className="mt-4 md:mt-8 text-center text-muted text-xs sm:text-sm"
        >
          <p>Tap any blue state to explore</p>
          <svg
            className="w-5 h-5 mx-auto mt-2 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </motion.div>
      </section>

      {/* Section divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
        className="mx-auto max-w-xs h-px bg-border origin-center my-4"
      />

      {/* Recent trips */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="py-10 md:py-16 px-4 md:px-8 max-w-6xl mx-auto"
      >
        <h2 className="font-heading text-xl md:text-2xl font-semibold text-heading mb-6 md:mb-8">
          Recent Adventures
        </h2>
        <TripGrid trips={trips} />
      </motion.section>
    </>
  );
}
