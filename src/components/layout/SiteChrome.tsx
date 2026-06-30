"use client";

import { usePathname } from "next/navigation";

/**
 * Gate for the site-wide header/footer. The marketing chrome belongs on the
 * public browse/read surfaces (home, /trips, trip detail) but NOT on:
 *  - /admin/*  — the private dashboard has its own header + "← Dashboard" nav
 *  - /embed/*  — iframe embeds are intentionally chrome-free
 * usePathname resolves during SSR in the App Router, so there is no flash.
 */
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/embed")) {
    return null;
  }
  return <>{children}</>;
}
