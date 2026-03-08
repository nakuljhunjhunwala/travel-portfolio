"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
}: BottomSheetProps) {
  // Escape key closes the sheet
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Body scroll lock (iOS-safe: prevent background scroll without page jump)
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
    } else {
      const top = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      if (top) window.scrollTo(0, parseInt(top, 10) * -1);
    }
    return () => {
      const top = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      if (top) window.scrollTo(0, parseInt(top, 10) * -1);
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bottom-sheet-title"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) onClose();
            }}
            className="fixed bottom-0 inset-x-0 z-50 bg-card rounded-t-2xl max-h-[75dvh] overflow-y-auto"
          >
            {/* Drag handle — enlarged touch area */}
            <div className="flex justify-center pt-3 pb-3 min-h-[44px] items-center">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* Title */}
            <h2
              id="bottom-sheet-title"
              className="text-heading font-heading text-lg px-4 pb-3"
            >
              {title}
            </h2>

            {/* Content */}
            <div className="px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
