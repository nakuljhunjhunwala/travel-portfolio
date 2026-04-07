"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  type EmbedTheme,
  onParentMessage,
} from "@/lib/embed-messenger";

/**
 * CSS variable overrides for each parent theme.
 * These adapt the travel portfolio's look to match the host portfolio's aesthetic.
 */
const THEME_OVERRIDES: Record<EmbedTheme, Record<string, string>> = {
  glass: {
    "--color-bg": "transparent",
    "--color-card": "rgba(255, 255, 255, 0.08)",
    "--color-heading": "#F1F5F9",
    "--color-body": "#CBD5E1",
    "--color-muted": "#94A3B8",
    "--color-border": "rgba(255, 255, 255, 0.15)",
    "--color-primary": "#A78BFA",
    "--color-primary-soft": "rgba(167, 139, 250, 0.15)",
    "--color-primary-text": "#C4B5FD",
  },
  retro: {
    "--color-bg": "transparent",
    "--color-card": "rgba(0, 255, 0, 0.05)",
    "--color-heading": "#00ff00",
    "--color-body": "#00cc00",
    "--color-muted": "#009900",
    "--color-border": "rgba(0, 255, 0, 0.2)",
    "--color-primary": "#00ff00",
    "--color-primary-soft": "rgba(0, 255, 0, 0.1)",
    "--color-primary-text": "#33ff33",
  },
  code: {
    "--color-bg": "transparent",
    "--color-card": "#2d2d30",
    "--color-heading": "#D4D4D4",
    "--color-body": "#CCCCCC",
    "--color-muted": "#858585",
    "--color-border": "#3e3e42",
    "--color-primary": "#007acc",
    "--color-primary-soft": "rgba(0, 122, 204, 0.15)",
    "--color-primary-text": "#4FC1FF",
  },
  terminal: {
    "--color-bg": "transparent",
    "--color-card": "rgba(0, 255, 0, 0.03)",
    "--color-heading": "#00ff00",
    "--color-body": "#00cc00",
    "--color-muted": "#007700",
    "--color-border": "rgba(0, 255, 0, 0.15)",
    "--color-primary": "#00ff00",
    "--color-primary-soft": "rgba(0, 255, 0, 0.08)",
    "--color-primary-text": "#00ff00",
  },
  neuro: {
    "--color-bg": "transparent",
    "--color-card": "#dde1e7",
    "--color-heading": "#2D3748",
    "--color-body": "#4A5568",
    "--color-muted": "#718096",
    "--color-border": "#c8ccd3",
    "--color-primary": "#667eea",
    "--color-primary-soft": "rgba(102, 126, 234, 0.12)",
    "--color-primary-text": "#5A67D8",
  },
  brutal: {
    "--color-bg": "transparent",
    "--color-card": "#FFFFFF",
    "--color-heading": "#000000",
    "--color-body": "#1A1A1A",
    "--color-muted": "#4A4A4A",
    "--color-border": "#000000",
    "--color-primary": "#6B4EFF",
    "--color-primary-soft": "rgba(107, 78, 255, 0.1)",
    "--color-primary-text": "#6B4EFF",
  },
};

/**
 * Reads the `?theme=` search param and listens for parent theme changes.
 * Applies CSS variable overrides to document root so the embed matches
 * the host portfolio's visual style.
 */
export function useEmbedTheme(): EmbedTheme | null {
  const searchParams = useSearchParams();
  const initialTheme = (searchParams.get("theme") as EmbedTheme) || null;
  const [theme, setTheme] = useState<EmbedTheme | null>(initialTheme);

  // Apply CSS variable overrides
  useEffect(() => {
    if (!theme) return;
    const overrides = THEME_OVERRIDES[theme];
    if (!overrides) return;

    const root = document.documentElement;
    const previous: Record<string, string> = {};

    for (const [prop, value] of Object.entries(overrides)) {
      previous[prop] = root.style.getPropertyValue(prop);
      root.style.setProperty(prop, value);
    }

    return () => {
      for (const [prop, value] of Object.entries(previous)) {
        if (value) {
          root.style.setProperty(prop, value);
        } else {
          root.style.removeProperty(prop);
        }
      }
    };
  }, [theme]);

  // Listen for parent theme changes via postMessage
  useEffect(() => {
    return onParentMessage((msg) => {
      if (msg.type === "PARENT_THEME_CHANGED") {
        setTheme(msg.theme);
      }
    });
  }, []);

  return theme;
}
