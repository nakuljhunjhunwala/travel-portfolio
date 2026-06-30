import { OWNER } from "@/lib/constants";

interface LogoProps {
  /** Pixel size of the square mark. Default 28. */
  size?: number;
  className?: string;
  title?: string;
}

/**
 * Compass Pin — the brand mark. A map pin whose interior is a compass needle.
 * Drawn in brand blue (#2B6CE6) with a white/soft-blue needle, on a transparent
 * background so it reads on the light header. Single source of truth for the
 * logo geometry (the favicon/PWA `icon.svg` mirrors this shape).
 */
export function Logo({ size = 28, className, title = `${OWNER.siteName} logo` }: LogoProps) {
  return (
    <svg
      width={size}
      height={(size * 40) / 32}
      viewBox="0 0 32 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
      className={className}
    >
      {/* Pin body (teardrop) */}
      <path
        d="M16 1.5C8.82 1.5 3 7.32 3 14.5c0 9.75 13 23 13 23s13-13.25 13-23c0-7.18-5.82-13-13-13Z"
        fill="var(--color-primary, #2B6CE6)"
      />
      {/* Compass needle — north (white) + south (soft blue) */}
      <polygon points="16,6.5 20.5,15 11.5,15" fill="#FFFFFF" />
      <polygon points="16,23.5 20.5,15 11.5,15" fill="#BBD5FF" />
      {/* Center hub */}
      <circle cx="16" cy="15" r="2.1" fill="#FFFFFF" />
    </svg>
  );
}

interface WordmarkProps {
  /** Pixel size of the mark. Default 26. */
  size?: number;
  className?: string;
  /** Hide the text label (mark only) below this breakpoint handled by caller. */
  showText?: boolean;
}

/**
 * The Compass Pin mark followed by the site name in the heading font.
 */
export function Wordmark({ size = 26, className, showText = true }: WordmarkProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <Logo size={size} />
      {showText && (
        <span className="font-heading font-bold text-heading text-base leading-none tracking-tight">
          {OWNER.siteName}
        </span>
      )}
    </span>
  );
}

export default Logo;
