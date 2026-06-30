import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { OWNER, SOCIAL } from "@/lib/constants";

/**
 * Light site-wide footer: brand mark + blurb, internal nav, and social link.
 * Reinforces internal linking + the Instagram `sameAs` signal for SEO.
 * Rendered inside `#embed-hide-chrome` so it never appears in iframe embeds.
 */
export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/70 bg-card/40">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2" aria-label={`${OWNER.siteName} — home`}>
            <Logo size={26} />
            <span className="font-heading text-base font-bold text-heading">{OWNER.siteName}</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Honest travel itineraries across India — real costs, real stays, and the
            stuff worth skipping. No influencer fluff.
          </p>
        </div>

        <nav className="flex flex-col gap-2 text-sm" aria-label="Footer">
          <span className="font-heading text-xs font-semibold uppercase tracking-wide text-muted">Explore</span>
          <Link href="/" className="text-body transition-colors hover:text-primary-text">Home</Link>
          <Link href="/trips" className="text-body transition-colors hover:text-primary-text">All Trips</Link>
          <a
            href={SOCIAL.instagram}
            target="_blank"
            rel="me noopener noreferrer"
            className="text-body transition-colors hover:text-primary-text"
          >
            Instagram
          </a>
        </nav>
      </div>

      <div className="border-t border-border/50 px-4 py-4 sm:px-6">
        <p className="mx-auto max-w-7xl text-xs text-muted">
          © {year} {OWNER.siteName}. Built and travelled by {OWNER.name}.
        </p>
      </div>
    </footer>
  );
}
