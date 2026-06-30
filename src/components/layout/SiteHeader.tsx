import Link from "next/link";
import { Wordmark } from "@/components/brand/Logo";
import UserMenu from "@/components/auth/UserMenu";

/**
 * Slim, sticky site-wide header: Compass Pin logo + wordmark (left, links home)
 * and the auth UserMenu (right). Rendered inside `#embed-hide-chrome` so it never
 * appears in iframe embeds. Sits at z-40 — below the homepage cinematic intro
 * overlay (z-50), so the intro plays unobstructed.
 */
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/70">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          aria-label="Nakul's Travels — home"
          className="flex items-center rounded-full transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Wordmark size={26} />
        </Link>
        <UserMenu />
      </div>
    </header>
  );
}
