import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { OWNER } from "@/lib/constants";
import UserMenu from "@/components/auth/UserMenu";
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

export const metadata: Metadata = {
  title: {
    default: `${OWNER.siteName} — ${OWNER.siteTagline}`,
    template: `%s | ${OWNER.siteName}`,
  },
  description:
    "Honest travel itineraries with real costs, personal notes, and day-by-day guides across India.",
  keywords: ["travel", "India", "itinerary", "travel portfolio"],
  authors: [{ name: OWNER.name }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: OWNER.siteName,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: OWNER.siteName,
    images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
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
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg focus:text-primary"
          >
            Skip to main content
          </a>
          <div className="fixed top-3 right-3 md:top-5 md:right-5 z-50">
            <UserMenu />
          </div>
          <main id="main-content" className="min-h-screen">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
