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

3-stage build (deps → builder → runner), Node 22 Alpine, standalone output, non-root user. `NEXT_PUBLIC_*` vars are build-time ARGs; server-only vars (`GEMINI_API_KEY`, `FIREBASE_ADMIN_*`, etc.) are runtime env.

## Project Overview

Personal travel portfolio inspired by Wanderlog's UI/UX. Showcases trips across India with real itineraries, costs, and honest opinions. Visitors browse freely; full content requires Google sign-in. Private admin dashboard tracks reader analytics. PWA-ready (`public/manifest.json`).

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
| `/api/place-details` | GET | Google Places v1 lookup + Gemini summary enrichment, Firestore cache |
| `/api/place-photo` | GET | Google Places photo proxy with Unsplash fallback |
| `/api/place-summary` | GET | Gemini 2-sentence summaries with Firestore cache |
| `/api/place-coordinates` | POST | Batch coordinate resolver for map markers (max 50 placeIds) |
| `/api/admin/analytics` | POST | Admin-only analytics, requires Bearer token verified against ADMIN_UID |

### Hooks

| Hook | Purpose |
|------|---------|
| `usePlaceDetails` | Fetches/caches place details per googlePlaceId. Module-level dedup cache. |
| `usePlaceCoordinates` | Batch-fetches coordinates for all places in visible days for map markers. |
| `useActiveDayObserver` | IntersectionObserver on `[data-day-number]` sections. Returns `activeDay` + `suppress()` for programmatic scrolls. |
| `useScrollTracking` | Records per-day view analytics to Firestore for logged-in users. |

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
- Google Places and Gemini API calls happen server-side via API routes with Firestore caching

### Content Gating
Controlled by `NEXT_PUBLIC_ENABLE_LOGIN_GATE` (default: true). When enabled and user is not logged in:
- Only Day 1 is visible, limited to `min(10% of total places, 50% of Day 1 places)`
- All other days are **not rendered** (no data sent to client)
- `LoginGate` component prompts for Google sign-in below the visible content

### Trip Detail Layout
- **Desktop (lg+)**: Split panel — itinerary left (55%), sticky interactive map right (45%)
- **Mobile**: Full-width itinerary + floating Map FAB (bottom-right) opens bottom sheet with map
- **Share FAB** (bottom-left): Native Web Share API on mobile, dropdown (WhatsApp/Twitter/Copy) on desktop
- Map syncs with scroll — `useActiveDayObserver` drives `activeDay` which controls map zoom/markers

### Homepage Cinematic Intro
Session-based (`sessionStorage`): plays once per tab, replays on new tab/revisit. Skip button after 2s. Phases: overlay → story stats → title → map reveal → ambient pills → complete.

## Environment Variables

Template at `.env.local.example`:
- `NEXT_PUBLIC_FIREBASE_*` — client-side Firebase config (6 keys)
- `FIREBASE_ADMIN_PRIVATE_KEY`, `FIREBASE_ADMIN_CLIENT_EMAIL` — server-only
- `GEMINI_API_KEY` — server-only
- `GOOGLE_PLACES_API_KEY` — server-only
- `NEXT_PUBLIC_MAPBOX_TOKEN` — public token
- `ADMIN_UID` — Firebase UID for admin access
- `NEXT_PUBLIC_ENABLE_LOGIN_GATE` — toggle content gating (default: true)
- `NEXT_PUBLIC_BASE_URL` — canonical URL (default: http://localhost:3000)
- `PORT` — server port (default: 3000)
