"use client";

import { Suspense, useEffect } from "react";
import { useEmbedTheme } from "@/hooks/useEmbedTheme";
import { sendToParent } from "@/lib/embed-messenger";

function EmbedTripInner({ children }: { children: React.ReactNode }) {
  useEmbedTheme();

  useEffect(() => {
    sendToParent({ type: "TRAVEL_EMBED_READY" });
  }, []);

  return <div className="overflow-y-auto" style={{ maxHeight: "100vh" }}>{children}</div>;
}

export default function EmbedTripWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <EmbedTripInner>{children}</EmbedTripInner>
    </Suspense>
  );
}
