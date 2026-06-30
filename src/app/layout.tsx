import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { OWNER } from "@/lib/constants";
import { SITE_URL } from "@/lib/site";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteChrome from "@/components/layout/SiteChrome";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta-sans",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const SITE_DESCRIPTION =
  "Honest travel itineraries with real costs, personal notes, and day-by-day guides across India.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${OWNER.siteName} — ${OWNER.siteTagline}`,
    template: `%s | ${OWNER.siteName}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: OWNER.siteName,
  authors: [{ name: OWNER.name }],
  creator: OWNER.name,
  publisher: OWNER.name,
  keywords: [
    "travel",
    "India",
    "travel itinerary",
    "India travel guide",
    "trip planner",
    "honest travel costs",
    "road trip India",
    "Kerala itinerary",
    "Goa itinerary",
    "Nakul's Travels",
  ],
  manifest: "/manifest.json",
  alternates: { canonical: "/" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: OWNER.siteName,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: OWNER.siteName,
    title: `${OWNER.siteName} — ${OWNER.siteTagline}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${OWNER.siteName} — ${OWNER.siteTagline}`,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#2B6CE6",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${inter.variable} ${jetbrainsMono.variable} bg-bg text-body antialiased`}
      >
        <AuthProvider>
          <SiteChrome>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:text-primary"
            >
              Skip to main content
            </a>
            <SiteHeader />
          </SiteChrome>
          <main id="main-content" className="min-h-screen">{children}</main>
          <SiteChrome>
            <SiteFooter />
          </SiteChrome>
        </AuthProvider>
      </body>
    </html>
  );
}
