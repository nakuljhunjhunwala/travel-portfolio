/**
 * postMessage bridge for iframe embed communication.
 *
 * Sends typed messages to the parent window and listens for
 * incoming messages from the meta-theme portfolio host.
 */

// --- Outgoing message types (travel → parent) ---

export type TravelOutgoingMessage =
  | { type: "TRAVEL_EMBED_READY" }
  | { type: "TRAVEL_STATE_SELECTED"; state: string }
  | { type: "TRAVEL_TRIP_CLICKED"; slug: string; title: string }
  | { type: "TRAVEL_NAV_REQUEST"; url: string };

// --- Incoming message types (parent → travel) ---

export type TravelIncomingMessage =
  | { type: "PARENT_THEME_CHANGED"; theme: EmbedTheme }
  | { type: "PARENT_AUTH_TOKEN"; token: string };

export type EmbedTheme =
  | "glass"
  | "retro"
  | "code"
  | "terminal"
  | "neuro"
  | "brutal";

const ALLOWED_ORIGINS = [
  "https://nakuljhunjhunwala.in",
  "http://localhost:3001",
  "http://localhost:3000",
];

/** Send a typed message to the parent window (no-op if not in iframe). */
export function sendToParent(message: TravelOutgoingMessage): void {
  if (typeof window === "undefined" || window.parent === window) return;

  // Try known origins; fallback to "*" for dev
  for (const origin of ALLOWED_ORIGINS) {
    try {
      window.parent.postMessage(message, origin);
      return;
    } catch {
      // origin mismatch — try next
    }
  }
  window.parent.postMessage(message, "*");
}

/** Check if currently running inside an iframe. */
export function isEmbedded(): boolean {
  if (typeof window === "undefined") return false;
  return window.parent !== window;
}

/**
 * Subscribe to incoming messages from the parent window.
 * Returns an unsubscribe function.
 */
export function onParentMessage(
  handler: (message: TravelIncomingMessage) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const listener = (event: MessageEvent) => {
    // Validate origin in production
    if (
      process.env.NODE_ENV === "production" &&
      !ALLOWED_ORIGINS.includes(event.origin)
    ) {
      return;
    }

    const data = event.data;
    if (
      data &&
      typeof data === "object" &&
      "type" in data &&
      (data.type === "PARENT_THEME_CHANGED" ||
        data.type === "PARENT_AUTH_TOKEN")
    ) {
      handler(data as TravelIncomingMessage);
    }
  };

  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
}
