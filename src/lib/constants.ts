/** Site owner / author info — single source of truth */
export const OWNER = {
  name: "Nakul",
  siteName: "Nakul's Travels",
  siteTagline: "Personal Travel Portfolio",
} as const;

/** Social / external profiles — used by the footer and JSON-LD `sameAs`. */
export const SOCIAL = {
  instagram: "https://instagram.com/nakuljhunjhunwala",
} as const;

/** All external profile URLs, for structured-data `sameAs`. */
export const SAME_AS: string[] = [SOCIAL.instagram];
