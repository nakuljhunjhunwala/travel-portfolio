"use client";

import { motion } from "framer-motion";
import LoginButton from "./LoginButton";

interface LoginGateProps {
  tripId: string;
  readerCount: number;
}

export default function LoginGate({ tripId, readerCount }: LoginGateProps) {
  // tripId will be used for analytics in Phase 4
  void tripId;

  return (
    <div className="relative mt-2">
      {/* Frosted blur overlay — fades last visible content out */}
      <div className="gate-blur pointer-events-none" aria-hidden="true" />

      {/* Login prompt card — overlays the blur */}
      <div className="relative z-10 flex justify-center px-4 -mt-16 md:-mt-12 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", damping: 22, stiffness: 200 }}
          className="w-full max-w-sm bg-card rounded-2xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.08),0_16px_48px_rgba(0,0,0,0.1)] border border-border/40"
        >
          {/* Accent strip */}
          <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-primary/30" />

          <div className="p-6 md:p-7 text-center">
            {/* Lock icon in themed circle */}
            <div className="w-14 h-14 rounded-2xl bg-primary-soft flex items-center justify-center mx-auto">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </div>

            <h3 className="font-heading font-bold text-heading text-lg md:text-xl mt-4">
              You&apos;re reading a preview
            </h3>
            <p className="text-muted text-sm mt-1">
              Sign in to unlock the full trip
            </p>

            {/* Benefits */}
            <div className="mt-5 space-y-3 text-left">
              <BenefitRow icon={<CalendarIcon />} text="Full day-by-day itinerary" />
              <BenefitRow icon={<NoteIcon />} text="Honest notes & what to skip" />
              <BenefitRow icon={<RupeeIcon />} text="Real costs & personal ratings" />
            </div>

            {/* Login button */}
            <div className="mt-6">
              <LoginButton className="w-full" />
            </div>

            {/* Social proof */}
            {readerCount > 0 && (
              <div className="flex items-center justify-center gap-1.5 mt-4 text-muted text-xs">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                </svg>
                <span>
                  <span className="font-mono font-medium">{readerCount}</span> people have read this trip
                </span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Benefit Row ── */

function BenefitRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
        {icon}
      </span>
      <span className="text-sm text-body font-body">{text}</span>
    </div>
  );
}

/* ── Inline SVG Icons ── */

function CalendarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><path d="M14 2v6h6" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function RupeeIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  );
}
