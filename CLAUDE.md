# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (port 3000)
pnpm build        # Production build — must pass with zero errors
pnpm lint         # ESLint
pnpm start        # Start production server (PORT from env, default 3000)
pnpm seed         # Seed Firestore from mock data (npx tsx scripts/seed-firestore.ts)
```

Package manager is **pnpm** — never use npm or yarn.

### Docker

```bash
docker build -t travel-portfolio \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY=... \
  --build-arg NEXT_PUBLIC_MAPBOX_TOKEN=... .
docker run -p 3000:3000 --env-file .env.local travel-portfolio
```

3-stage build (deps → builder → runner), Node 22 Alpine, standalone output, non-root user. `NEXT_PUBLIC_*` vars are build-time ARGs; server-only vars (`FIREBASE_ADMIN_*`, `ADMIN_UID`) are runtime env.

## Project Overview

Personal travel portfolio inspired by Wanderlog's UI/UX. Showcases trips across India with real itineraries, costs, and honest opinions. Visitors browse freely; full content requires Google sign-in. Private admin dashboard tracks reader analytics. PWA-ready (`public/manifest.json`).

All place data (coordinates, description, address, rating, photo, contacts) is **researched by hand at authoring time and stored inline on each Place** — there are no runtime Gemini/Google Places calls. The site is fully static (SSG); see "Static / content workflow" below.

## Architecture

- **Next.js 16.1.6** with App Router, `src/` directory, TypeScript strict mode, `output: "standalone"`
- **React 19** with Server Components by default; `"use client"` only when needed
- **Tailwind CSS v4** — CSS-first config via `@theme` blocks in `src/styles/theme.css`, no `tailwind.config.js`
- **Firebase** client SDK (Auth, Firestore) + Admin SDK (server-side only)
- **Framer Motion** for animations where motion adds meaning — not on every element
- **Mapbox GL JS** for interactive trip maps (dynamic import, loaded only on trip detail pages)

### Routing

```
/                    Homepage (India SVG map + cinematic intro + trip cards)
/trips/[slug]        Trip detail (split panel: itinerary + interactive map)
/admin               Private analytics dashboard (ADMIN_UID only)
```

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/analytics` | POST | Admin-only analytics, requires Bearer token verified against ADMIN_UID |

There are intentionally **no runtime place-enrichment routes** — place data is self-contained on each Place document.

### Hooks

| Hook | Purpose |
|------|---------|
| `useActiveDayObserver` | IntersectionObserver on `[data-day-number]` sections. Returns `activeDay` + `suppress()` for programmatic scrolls. |
| `useScrollTracking` | Records per-day view analytics to Firestore for logged-in users (atomic `increment`/`arrayUnion`). |
| `useEmbedTheme` | Applies theme CSS vars in iframe embed mode (reads `?theme=`, listens for parent messages). |

Map coordinates and place metadata come directly from the inline `Place` fields (`lat`/`lng`, `description`, `address`, `rating`, `ratingCount`, `photoUrl`, contacts) — no fetch hooks.

### Key Files

| File | Purpose |
|------|---------|
| `src/styles/theme.css` | All design tokens via Tailwind v4 `@theme`. Per-trip theme overrides via `[data-trip-theme]`. |
| `src/app/layout.tsx` | Root layout: fonts, AuthProvider, PWA manifest, SEO metadata, viewport safe-area |
| `src/lib/firebase.ts` | Client SDK with lazy getters (`getFirebaseAuth()`, `getFirebaseDb()`) — SSR-safe |
| `src/lib/firebase-admin.ts` | Admin SDK — server-side only, never import in client components |
| `src/lib/auth-context.tsx` | `AuthProvider` + `useAuth()` hook |
| `src/types/firestore.ts` | All data interfaces: Trip, Day, Place, TravelConnector, UserProfile, etc. |
| `src/data/mock-trips.ts` | Mock trip data used by seed script and SSG |
| `src/app/trips/[slug]/TripDetailContent.tsx` | Main trip page: content gating, split panel layout, map integration, share FAB |

## Design System

The UI follows **Wanderlog's design language** — hand-crafted and premium, not generic.

### Fonts
- **Plus Jakarta Sans** (`font-heading`) — headings, titles
- **Inter** (`font-body`) — body text, UI
- **JetBrains Mono** (`font-mono`) — costs, distances, stats

### Theme Tokens
Use Tailwind classes mapped to CSS variables: `bg-bg`, `text-heading`, `text-muted`, `bg-card`, `bg-primary`, `bg-primary-soft`, `text-primary-text`, `shadow-card`, `rounded-card`.

### Per-Trip Color Themes
Applied via `[data-trip-theme="rajasthan"]` on a wrapper element. Each trip overrides `--color-primary`, `--color-primary-soft`, `--color-primary-text`. Defined themes: rajasthan, kerala, ladakh, himachal.

## Critical Patterns

### Firebase SSR Safety
Firebase client SDK must never initialize at module level:
```ts
// CORRECT — call inside useEffect or event handlers
const auth = getFirebaseAuth();

// WRONG — causes SSR build failure
import { auth } from "./firebase";
```

### Server vs Client Split
- API keys without `NEXT_PUBLIC_` prefix are server-side only
- `firebase-admin.ts` must never be imported in `"use client"` components
- No third-party place/AI APIs are called at runtime — all such data is stored inline on Places

### Content Gating
Controlled by `NEXT_PUBLIC_ENABLE_LOGIN_GATE` (default: true). This is a **client-side visual gate**, not server-enforced. When enabled and the user is not logged in:
- Only Day 1 is shown, limited to `min(10% of total places, 50% of Day 1 places)`; `LoginGate` prompts for Google sign-in below it.
- Note: the full day/place data is still present in the page payload (gating hides it visually). The share menu only ever serializes the **visible** content, and "Copy Itinerary" is hidden in the gated preview, so sharing cannot leak premium content. (Truly hiding the payload would require server-enforced auth, which is out of scope for the static model.)

### Place photo hosts
Place `photoUrl`s are manual; any host must be allowed in `next.config.mjs` `images.remotePatterns`. Currently allowed: `images.unsplash.com`, `lh3.googleusercontent.com`, `upload.wikimedia.org`, `api.mapbox.com`. Photos on other hosts won't render — use one of these or rely on the curated `getPlacePhotoUrl` fallback (`src/lib/photos.ts`).

### Trip Detail Layout
- **Desktop (lg+)**: Split panel — itinerary left (55%), sticky interactive map right (45%)
- **Mobile**: Full-width itinerary + floating Map FAB (bottom-right) opens bottom sheet with map
- **Share FAB** (bottom-left): always opens the dropdown menu (WhatsApp / Twitter / Email / Copy Itinerary / Copy Link). On devices with the Web Share API, the menu's top "Share…" item triggers the native sheet — so all options stay reachable on mobile. Share text is built by `generateShareBlurb` (title · days · cities · ₹total); "Copy Itinerary" is hidden in the gated preview.
- Map syncs with scroll — `useActiveDayObserver` drives `activeDay` which controls map zoom/markers

### Homepage Cinematic Intro
Session-based (`sessionStorage`): plays once per tab, replays on new tab/revisit. Skip button after 2s. Phases: overlay → story stats → title → map reveal → ambient pills → complete.

### Static / content workflow
The site is statically generated (`generateStaticParams`). Adding a new trip — or editing any day/place in Firestore — does **not** appear live until the next build/redeploy. This is intentional: research and populate every detail (coordinates, description, rating, photo, contacts) inline, then deploy. Old `coming_soon` trips remain as-is; only new trips get full itineraries going forward.

## Environment Variables

Template at `.env.local.example`:
- `NEXT_PUBLIC_FIREBASE_*` — client-side Firebase config (6 keys)
- `FIREBASE_ADMIN_PRIVATE_KEY`, `FIREBASE_ADMIN_CLIENT_EMAIL` — server-only
- `NEXT_PUBLIC_MAPBOX_TOKEN` — public token
- `ADMIN_UID` — Firebase UID for admin access
- `NEXT_PUBLIC_ENABLE_LOGIN_GATE` — toggle content gating (default: true)
- `NEXT_PUBLIC_BASE_URL` — canonical URL (default: http://localhost:3000)
- `PORT` — server port (default: 3000)
