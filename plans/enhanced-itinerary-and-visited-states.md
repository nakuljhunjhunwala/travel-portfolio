# Blueprint: Enhanced Itinerary + Visited States

**Objective:** Improve the travel portfolio with richer itinerary data (contacts, hotel info, Google Maps links), better sharing, and a "visited states without itinerary" feature showing all traveled states on the India map.

**Created:** 2026-04-07
**Status:** Draft — awaiting user approval
**Estimated Steps:** 6 (2 parallel tracks after Step 2)
**Review:** Adversarial review completed. 3 critical, 5 high findings fixed in v2.

---

## Dependency Graph

```
Step 1 ──── Step 2 ──── Step 3 ────┬──── Step 5 ──── Step 6
(Types)     (Data)      (Migration  │     (Sharing)    (Cleanup)
                        + Map UI)   │
                                    └──── Step 4
                                          (PlaceCard)

Sequential: 1 → 2 → 3 (migration must be atomic)
Parallel after Step 3:
  Track A: Step 4 (Enhanced PlaceCard + Contacts)
  Track B: Step 5 (Sharing improvements)
Final: Step 6 (cleanup + deprecation removal)
```

**Key design decision:** The `published: boolean` → `status: string` migration uses a **phased approach** to avoid breaking the build or Firestore rules at any step:
- Step 1: Add `status` as optional, keep `published` (both coexist)
- Step 2: Mock data writes both fields
- Step 3: Migrate ALL code + Firestore rules atomically, then `published` becomes dead code
- Step 6: Remove `published` from the type (cleanup)

---

## Step 1: Data Model Extension (Foundation)

**Model tier:** Sonnet (surgical type changes, low risk)
**Branch:** `feat/enhanced-data-model`
**Depends on:** Nothing
**Files touched:** `src/types/firestore.ts`

### Context Brief

The project has 4 core Firestore types in `src/types/firestore.ts`:
- `Trip` — trip metadata with `published: boolean` (line 16)
- `Day` — daily itinerary entry (dayNumber, city, dayTitle)
- `Place` — individual location (name, googlePlaceId, cost, rating, honestNote)
- `TravelConnector` — transit info between places (mode, duration, directionsUrl)

**IMPORTANT:** Do NOT remove `published: boolean` from Trip. Add `status` alongside it as optional. This is the phased migration strategy — removing `published` happens in Step 6 after all code is migrated.

### Tasks

1. **Extend `Place` interface** — add optional fields:
   ```typescript
   phoneNumber?: string;          // Click-to-call on mobile
   websiteUrl?: string;           // Official website
   googleMapsUrl?: string;        // Persistent GMaps link (not dependent on API enrichment)
   placeCategory?: "attraction" | "restaurant" | "cafe" | "hotel" | "market" | "temple" | "beach" | "trek" | "transport";
   ```

2. **Extend `TravelConnector` interface** — add contact fields:
   ```typescript
   contactName?: string;          // e.g., "Raju" (auto driver)
   contactPhone?: string;         // e.g., "+91-98xxx"
   note?: string;                 // e.g., "Pre-book for airport pickup"
   costEstimate?: string;         // e.g., "₹150-200"
   ```

3. **Add `Accommodation` interface** (nested in Day, not a subcollection — intentionally has no `id` field) and extend `Day`:
   ```typescript
   export interface Accommodation {
     name: string;                // e.g., "Hotel Pearl Palace"
     phoneNumber?: string;
     googleMapsUrl?: string;
     costPerNight?: string;       // e.g., "₹1,800"
     totalCost?: string;          // if multi-night
     checkIn?: string;            // e.g., "2:00 PM"
     checkOut?: string;           // e.g., "11:00 AM"
     bookingUrl?: string;         // Booking.com, MakeMyTrip link
     rating?: number;             // 1-5 your rating
     honestNote?: string;         // "Clean rooms, noisy AC"
     photoUrl?: string;
   }

   // Add to Day interface:
   accommodation?: Accommodation;
   ```

4. **Add `status` field to `Trip` AS OPTIONAL** (keep `published` intact):
   ```typescript
   // ADD (do not remove published):
   status?: "published" | "coming_soon" | "draft";
   ```

5. **Add visited-only fields to `Trip`** (for coming_soon trips):
   ```typescript
   visitedHighlight?: string;     // e.g., "3 days road trip through tea country"
   visitedDate?: string;          // e.g., "March 2024" (display-only)
   ```

### Verification

- `pnpm build` passes (all new fields are optional, existing code untouched)
- No runtime changes in this step

### Exit Criteria

- All 5 type additions in `src/types/firestore.ts`
- `published: boolean` still exists on Trip (unchanged)
- Build passes with zero errors

### Rollback

Revert the single file. All fields are optional — zero downstream breakage.

---

## Step 2: Mock Data + Seed Script Updates

**Model tier:** Sonnet (data entry, medium effort)
**Branch:** `feat/enhanced-mock-data`
**Depends on:** Step 1
**Files touched:** `src/data/mock-trips.ts`, `src/data/mock-days.ts`, `src/data/mock-places.ts`, `src/data/state-zoom-config.ts`, `scripts/seed-firestore.ts`

### Context Brief

Mock data lives in `src/data/`:
- `mock-trips.ts` — 4 trips (3 with `published: true`, 1 with `published: false`)
- `mock-days.ts` — days keyed by trip ID
- `mock-places.ts` — places keyed by day ID (partially populated: Raj D1-D2, Him D1-D2, Ker D1)
- `state-zoom-config.ts` — map zoom settings for 3 states

The seed script at `scripts/seed-firestore.ts` writes to Firestore: `trips/{id}/days/{id}/places/{id}`.

**IMPORTANT (H4 fix):** The Trip interface has many REQUIRED fields (`startDate`, `endDate`, `budgetTier`, `totalCost`, `tripDNA`, `bestMoment`, `skipThis`, `bestMonth`, `travelMode`, `tripType`). Coming_soon trips MUST populate ALL required fields with reasonable placeholder values to satisfy TypeScript. This is cleaner than making 10+ fields optional and adding null checks everywhere.

### Tasks

1. **Add `status` to ALL existing mock trips** (keep `published` too — dual-write):
   - Rajasthan, Himachal, Kerala: add `status: "published"` (keep `published: true`)
   - Ladakh: add `status: "draft"` (keep `published: false`)

2. **Add 4-6 "coming_soon" trips** with ALL required fields populated:
   ```typescript
   {
     id: "trip-goa-2023",
     title: "Goa Beach Escape",
     slug: "goa-beach-escape",
     coverPhoto: "/images/goa-cover.svg",
     states: ["Goa"],
     cities: ["Panaji", "Calangute", "Palolem"],
     startDate: { seconds: 1702425600, nanoseconds: 0 },  // Dec 2023
     endDate: { seconds: 1702684800, nanoseconds: 0 },
     tags: ["beaches", "seafood", "nightlife"],
     budgetTier: "₹₹" as const,
     totalCost: 18000,
     published: false,            // Keep for backward compat
     status: "coming_soon",       // New field
     tripTheme: "goa",
     tripDNA: { nature: 70, food: 80, culture: 30 },
     bestMoment: "Sunset at Palolem with fresh king prawns",
     skipThis: "North Goa club scene — overrated and overpriced",
     bestMonth: "November",
     hookLine: "Three days of beaches, seafood, and zero plans.",
     travelMode: ["scooter", "auto"],
     tripType: "couple" as const,
     visitedHighlight: "Beach hopping and seafood trail along the coast",
     visitedDate: "December 2023",
   }
   ```
   Add similar for: Karnataka, Uttarakhand, Maharashtra, Tamil Nadu, Punjab.

3. **Enrich existing mock places** with new fields:
   - Add `phoneNumber` to restaurants (e.g., LMB Jaipur: `"+91-141-2565844"`)
   - Add `googleMapsUrl` to ALL places: `https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`
   - Add `placeCategory` to ALL places (attraction, restaurant, cafe, temple, etc.)
   - Add `contactName`/`contactPhone`/`costEstimate` to 3-4 TravelConnectors (especially auto-rickshaw ones)

4. **Add accommodation data** to mock days:
   - Rajasthan D1-D2 (same hotel both nights): `Hotel Pearl Palace, Jaipur` (₹1,800/night, phone, GMaps URL, honest note)
   - Himachal D1: `Hostel in Old Manali` (₹500/night)
   - Kerala D1: `Fort House Hotel, Kochi` (₹2,200/night)

5. **Add state-zoom-config entries** for all new states:
   - Goa: center [73.95, 15.35], zoom ~6.0, cities [Panaji, Calangute, Palolem]
   - Karnataka: center [76.5, 14.5], zoom ~3.5, cities [Bangalore, Hampi, Coorg]
   - Uttarakhand: center [79.0, 30.3], zoom ~4.0, cities [Rishikesh, Mussoorie]
   - Maharashtra: center [75.5, 19.5], zoom ~3.0, cities [Mumbai, Lonavala]
   - Tamil Nadu: center [79.5, 11.0], zoom ~3.5, cities [Chennai, Pondicherry, Mahabalipuram]
   - Punjab: center [75.3, 31.1], zoom ~4.5, cities [Amritsar]

6. **Update seed script** to handle:
   - New optional fields in places, days, and travel connectors
   - Accommodation nested objects in days (the existing deep-walk timestamp converter handles nested objects already)
   - Skip day/place seeding for `coming_soon` trips (they have no subcollections)
   - Both `published` and `status` fields written to Firestore

### Verification

- `pnpm build` passes (mock data satisfies ALL required Trip fields)
- `pnpm seed` completes without errors
- Firestore shows trips with BOTH `published` and `status` fields
- Existing app still works (code still reads `published`, which is unchanged)

### Exit Criteria

- 4-6 coming_soon trips with ALL required fields
- All existing places have `googleMapsUrl` and `placeCategory`
- At least 3 days have accommodation data
- stateZoomConfig has entries for all new states
- Seed script handles all new fields

### Rollback

Revert data files. Re-seed Firestore. App still works via `published` field.

---

## Step 3: Code Migration + Visited States Map UI

**Model tier:** Sonnet (medium-high complexity — migration + UI in one atomic step)
**Branch:** `feat/visited-states-and-migration`
**Depends on:** Step 2 (needs coming_soon trips in data + stateZoomConfig)
**Files touched:** `src/lib/trips.ts`, `src/lib/admin.ts`, `src/components/HomeContent.tsx`, `src/components/map/IndiaMap.tsx`, `src/components/map/IndiaMapWrapper.tsx`, `src/components/trip/TripCard.tsx`, `src/components/trip/TripGrid.tsx`, `src/app/page.tsx`, `src/app/trips/[slug]/page.tsx`, `src/app/trips/[slug]/TripDetailContent.tsx`, `src/app/admin/AdminDashboard.tsx`, `src/app/sitemap.ts`, `firestore.rules`

### Context Brief

**Why this step is combined (migration + map UI):** The adversarial review (C3) identified that migrating `published` → `status` across code, Firestore rules, and UI must be **atomic**. If you update Firestore rules to check `status` but leave code checking `published`, or vice versa, things break. By combining the code migration with the map UI work (which is the primary consumer of the new `status` field), we ensure everything switches over together.

**Current `published` references (7 locations):**
1. `src/lib/trips.ts` — `getPublishedTrips()` Firestore query: `.where("published", "==", true)`
2. `src/lib/admin.ts:61` — `doc.data().published as boolean`
3. `src/lib/admin.ts:65` — `trips.filter((t) => t.published).length`
4. `src/lib/admin.ts:127` — `published: trip.published`
5. `src/components/HomeContent.tsx:103` — `trips.filter((t) => t.published)`
6. `src/components/map/IndiaMapWrapper.tsx:79` — `trip.published && trip.states.includes(...)`
7. `src/app/admin/AdminDashboard.tsx:283` — `!trip.published` for "Draft" badge

**Firestore security rules** (`firestore.rules` lines 6, 10, 14):
```
allow read: if resource.data.published == true;
```
These MUST be updated to check `status` instead, or all client-side reads will fail once data has `status` but code queries on `status`.

**Homepage data flow:**
1. `page.tsx` calls `getPublishedTrips()` → passes to `<HomeContent>`
2. `HomeContent` → `<IndiaMapWrapper trips={trips}>`
3. `IndiaMapWrapper` derives `visitedStateNames` from trip states
4. `IndiaMap` colors visited states, shows zoom panel on click

**IndiaMap needs TWO sets of state names** (M2 fix): `publishedStateNames` and `comingSoonStateNames` to render them with different styles.

### Tasks

#### Part A: Code Migration (all `published` → `status`)

1. **Update `src/lib/trips.ts`**:
   - Rename `getPublishedTrips()` → `getVisibleTrips()` (returns `status !== "draft"`)
   - Add filter: `.where("status", "in", ["published", "coming_soon"])`
   - Keep a `getPublishedTrips()` wrapper that further filters to `status === "published"` only
   - Update `serializeTimestamps` if needed (no change expected)

2. **Update `firestore.rules`** — change ALL read rules:
   ```
   // Trips
   allow read: if resource.data.status == "published" || resource.data.status == "coming_soon";

   // Days + Places (subcollection reads check parent trip)
   allow read: if get(/databases/$(database)/documents/trips/$(tripId)).data.status in ["published", "coming_soon"];
   ```

3. **Update `src/lib/admin.ts`**:
   - Line 61: `status: doc.data().status as string` (or fallback: `doc.data().status || (doc.data().published ? "published" : "draft")`)
   - Line 65: `.filter((t) => t.status === "published").length`
   - Line 127: `status: trip.status`
   - Update the `TripAnalyticsRow` interface/type to use `status` instead of `published`

4. **Update `src/components/HomeContent.tsx:103`**:
   - Change `trips.filter((t) => t.published)` → `trips.filter((t) => t.status === "published")`

5. **Update `src/components/map/IndiaMapWrapper.tsx:79`**:
   - Change `trip.published` → `trip.status === "published"`
   - Derive two sets: `publishedStateNames` and `comingSoonStateNames`
   - Pass both to `IndiaMap`

6. **Update `src/app/admin/AdminDashboard.tsx:283`**:
   - Change `!trip.published` → `trip.status !== "published"`
   - Show status badges: "Published" (green), "Coming Soon" (amber), "Draft" (gray)

7. **Update `src/app/trips/[slug]/page.tsx`**:
   - `generateStaticParams()`: use `getVisibleTrips()` (include coming_soon slugs for SSG)
   - In the page component: if `trip.status === "coming_soon"`, render `<ComingSoonContent>` instead of `<TripDetailContent>` (H2 fix — branch in the server component)

8. **Update `src/app/sitemap.ts`**:
   - Include coming_soon trip URLs

#### Part B: Map UI for Visited States

9. **Update `IndiaMap.tsx`** — accept new props and differentiate states:
   - New prop: `comingSoonStateNames: Set<string>` (alongside existing `visitedStateNames`)
   - Published states: solid primary color fill (existing)
   - Coming_soon states: primary color at 35% opacity + dashed stroke border
   - Both are clickable
   - Subtle pulse animation on coming_soon states

10. **Update `IndiaMapWrapper.tsx`** — handle coming_soon zoom panel:
    - When zoomed into a state with only coming_soon trips:
      - Show state name + "Coming Soon" badge (amber pill)
      - `visitedHighlight` text
      - `visitedDate` display
      - "Detailed itinerary coming soon" message
    - For states with published trips: existing TripCard behavior unchanged
    - For states with both: show published TripCards + coming_soon note

11. **Update `TripCard.tsx`** — add coming_soon variant:
    - When `trip.status === "coming_soon"`: simplified card layout
    - Cover photo or gradient placeholder
    - State + visitedDate badge (instead of date range)
    - hookLine text
    - "Itinerary Coming Soon" pill overlay (amber/primary-soft)
    - No stats footer (duration/budget/type still exist in data but aren't meaningful for coming_soon)

12. **Create `ComingSoonContent.tsx`** — coming_soon trip detail page:
    - New client component at `src/app/trips/[slug]/ComingSoonContent.tsx`
    - Hero: cover photo with gradient overlay
    - Title card with trip name, states, visitedDate
    - visitedHighlight text
    - "Detailed itinerary is being prepared" message
    - Trip DNA bars (if meaningful data exists)
    - "Back to map" link that navigates to homepage
    - No map, no day tabs, no place cards

13. **Update homepage stats** in `HomeContent.tsx`:
    - Total states: count ALL states (published + coming_soon)
    - Show breakdown: "9 states explored" (was "3 states explored")
    - Update cities count to include coming_soon cities

14. **Update `TripGrid.tsx`** — add "More Explored" section:
    - After published trip cards grid
    - Heading: "More States Explored" with muted style
    - Compact row of coming_soon trip cards
    - Visual hierarchy: published trips prominent, coming_soon lighter

### Verification

- `pnpm build` passes
- `firebase deploy --only firestore:rules` succeeds (or test with emulator)
- Homepage: 9+ states colored on map (3 solid, 6+ lighter)
- Clicking coming_soon state shows appropriate zoom panel
- Clicking published state works identically to before
- `/trips/goa-beach-escape` shows ComingSoonContent page
- `/trips/rajasthan-road-trip` works exactly as before
- Admin dashboard shows status badges correctly
- Mobile layout works (375px)

### Exit Criteria

- ALL 7 `published` references migrated to `status`
- Firestore rules updated and deployed
- Map shows all visited states with visual differentiation
- ComingSoonContent page works for coming_soon trips
- Homepage stats reflect all states
- Zero build errors

### Rollback

Revert code changes + Firestore rules. Since Firestore data has BOTH `published` and `status` fields (dual-write from Step 2), reverting code to use `published` is safe.

---

## Step 4: Enhanced PlaceCard with Contacts & Google Maps

**Model tier:** Sonnet (UI component work)
**Branch:** `feat/enhanced-place-card`
**Depends on:** Step 3 (needs migrated code + enriched data from Step 2 for visual testing)
**Parallel with:** Step 5

**Files touched:** `src/components/place/PlaceCard.tsx`, `src/components/place/TravelConnector.tsx`, `src/app/trips/[slug]/TripDetailContent.tsx`

### Context Brief

**PlaceCard** (`src/components/place/PlaceCard.tsx`, ~230 lines):
- Already links place name to `details?.googleMapsUri` (from Google Places API enrichment)
- Shows: pin number, name, address, Google rating, hours, Gemini summary, photo, time pill
- HonestNote section (rating, cost, would-return, note) for logged-in users
- No phone number, no explicit GMaps button, no place category badge

**TravelConnector** (`src/components/place/TravelConnector.tsx`, ~58 lines):
- Shows: dotted line, transport icon, duration, distance, "Directions" link
- No driver contact info, no cost estimate

**Day sections** in `TripDetailContent.tsx`:
- Renders PlaceCards with TravelConnectors between them
- No accommodation section per day

**Data availability:** After Step 2, mock places have `phoneNumber`, `googleMapsUrl`, `placeCategory`, and some TravelConnectors have `contactName`/`contactPhone`/`costEstimate`. Days have `accommodation` objects. This data is needed to visually verify the UI changes.

### Tasks

1. **Add action buttons row to PlaceCard** (below time pill):
   - "Open in Maps" pill button — uses `place.googleMapsUrl` (persistent) OR `details?.googleMapsUri` (API enrichment) as fallback
   - Map pin icon + "Maps" label
   - Opens in new tab
   - If `place.phoneNumber` exists: phone icon + number, `tel:` href for click-to-call on mobile
   - If `place.websiteUrl` exists: globe icon + "Website", opens in new tab
   - Style: row of small outlined pills, primary color on hover, consistent spacing
   - Row only renders if at least one action exists (GMaps URL almost always available)

2. **Add place category badge to PlaceCard**:
   - If `place.placeCategory` exists, show as a tiny colored pill next to or below the pin number
   - Color map: restaurant=orange, cafe=amber, hotel=blue, temple=purple, trek=green, beach=cyan, market=pink, attraction=primary
   - Compact: just the icon + label at small font size

3. **Enhance TravelConnector** with driver contact info:
   - If `connector.contactName` or `connector.contactPhone` exists:
     - New line below duration/distance: person icon + "Raju" + phone icon + "+91-98xxx"
     - Phone number is `tel:` link (click-to-call)
   - If `connector.costEstimate` exists: "~₹150-200" in mono font, same line
   - If `connector.note` exists: italic text below, muted color
   - All optional — connector renders identically when these fields are absent

4. **Add Accommodation card** to day sections in `TripDetailContent.tsx`:
   - After the last PlaceCard + TravelConnector of each day, before the next day
   - If `day.accommodation` exists, render a distinct card:
     - Bed/moon icon + hotel name (linked to `accommodation.googleMapsUrl`)
     - Cost per night in mono font
     - Check-in / check-out times pill
     - Phone number (click-to-call)
     - Booking URL as "Book" button (opens new tab)
     - Rating + honest note (reuse HonestNote component if `rating` + `honestNote` exist)
   - Style: softer bg color (e.g., blue-50 tint), dashed top border, subtle bed icon accent
   - Visible to ALL users (accommodation info is practical, not gated behind login)

### Verification

- `pnpm build` passes
- Visit `/trips/rajasthan-road-trip` — PlaceCards show GMaps button, phone numbers on LMB
- TravelConnectors with driver info show contact details
- Accommodation card appears after Day 1 and Day 2 (Hotel Pearl Palace)
- Places WITHOUT new fields render identically to before (no empty rows, no broken layout)
- Mobile: action buttons stack or wrap cleanly at 375px
- Click-to-call works on mobile (test `tel:` links)

### Exit Criteria

- All 4 UI enhancements implemented
- Graceful degradation when optional fields absent
- Consistent with existing design tokens (primary, primary-soft, muted, mono font for costs)
- Responsive across mobile/tablet/desktop

### Rollback

Revert 3 component files. Pure UI changes, no data migration.

---

## Step 5: Improved Sharing

**Model tier:** Sonnet (UI + utility work)
**Branch:** `feat/improved-sharing`
**Depends on:** Step 3 (needs `status` migration complete, uses `googleMapsUrl` from data)
**Parallel with:** Step 4

**Files touched:** `src/app/trips/[slug]/TripDetailContent.tsx` (share FAB + day headers), new file `src/lib/share.ts`

### Context Brief

**Current sharing** (in `TripDetailContent.tsx`):
- FAB button fixed bottom-left
- Native Web Share API on mobile (title + URL only)
- Fallback dropdown: WhatsApp (pre-filled text), Twitter/X, Copy Link
- Shares the trip page URL — no per-day sharing, no itinerary text

**NOTE:** This step only applies to `status === "published"` trips. ComingSoonContent (from Step 3) has its own simpler share if needed.

### Tasks

1. **Create `src/lib/share.ts`** — utility functions:
   - `generateItineraryText(trip, days, dayPlaces, baseUrl)` — formatted text:
     ```
     Rajasthan Road Trip (7 Days)
     Jaipur > Jodhpur > Jaisalmer > Udaipur
     Total: Rs.28,500

     Day 1: The Pink City Welcome (Jaipur)
     1. Hawa Mahal - 9:30-11:00 AM - Rs.50
        Maps: https://www.google.com/maps/place/?q=place_id:ChIJ...
     2. City Palace - 11:15-1:30 PM - Rs.500
        Maps: https://www.google.com/maps/place/?q=place_id:ChIJ...
     Stay: Hotel Pearl Palace - Rs.1,800/night
        Phone: +91-141-xxx
        Maps: https://www.google.com/maps/...

     Day 2: ...

     Full itinerary: https://yoursite.com/trips/rajasthan-road-trip
     ```
   - `generateDayText(trip, day, places, baseUrl)` — same format for a single day
   - `generateShareUrl(baseUrl, tripSlug, dayNumber?)` — URL with optional `#day-N` anchor
   - **Handle missing optional fields gracefully** — skip lines for absent phoneNumber, accommodation, googleMapsUrl (L2 fix)

2. **Add per-day share button**:
   - In each day's header row (near the collapse chevron)
   - Small share icon (arrow-up-from-square)
   - On tap: native Web Share API (if available) with `generateDayText()`, else copy to clipboard
   - URL includes `#day-N` anchor

3. **Add "Copy Itinerary" option to main share menu**:
   - New option in existing dropdown: "Copy Full Itinerary" with clipboard icon
   - Copies `generateItineraryText()` to clipboard
   - Shows "Copied!" toast (reuse existing copy feedback pattern)

4. **Add "Share via Email" option to main share menu**:
   - `mailto:` link with pre-filled subject and body
   - Subject: "Check out my {trip.title} itinerary"
   - Body: truncated itinerary text (email body length limits)

5. **Enhance WhatsApp sharing**:
   - Currently shares just title + URL
   - New format: `"{trip.title} ({days} days)\n{cities}\n{hookLine}\n\n{shareUrl}"`

6. **Add day anchor deep-link support**:
   - Ensure day sections have `id="day-{N}"` attributes (check if `data-day-number` sections already have IDs)
   - On page mount: if URL hash is `#day-N`, auto-scroll to that day and expand it
   - Works for both direct navigation and shared links

### Verification

- `pnpm build` passes
- Share FAB: all existing options still work
- "Copy Full Itinerary" produces clean text with GMaps links
- Per-day share button appears in day headers, produces day-specific content
- Navigate to `/trips/rajasthan-road-trip#day-2` → page scrolls to Day 2
- WhatsApp share includes richer text
- Email share opens mail client with pre-filled content
- Mobile: share buttons don't overlap FABs or crowd the UI

### Exit Criteria

- 6 sharing improvements implemented
- `share.ts` utility tested with various data shapes (some places missing optional fields)
- Deep linking via day anchors works
- No regression on existing share

### Rollback

Revert `TripDetailContent.tsx` share section + delete `src/lib/share.ts`.

---

## Step 6: Cleanup — Remove Deprecated `published` Field

**Model tier:** Sonnet (cleanup, low risk)
**Branch:** `feat/cleanup-published-field`
**Depends on:** Steps 3, 4, 5 (all code migrated to `status`)

**Files touched:** `src/types/firestore.ts`, `src/data/mock-trips.ts`, `scripts/seed-firestore.ts`, `src/app/trips/[slug]/opengraph-image.tsx`

### Context Brief

After Steps 1-5, the codebase is fully migrated to use `trip.status` instead of `trip.published`. The `published` field still exists on the Trip type and in mock data as a deprecated artifact. This step removes it and handles remaining polish.

### Tasks

1. **Remove `published: boolean` from Trip interface** in `src/types/firestore.ts`

2. **Remove `published` from all mock trips** in `src/data/mock-trips.ts`

3. **Update seed script** to not write `published` field to Firestore

4. **Run `pnpm seed`** to update Firestore documents (removes `published` from new writes — note: Firestore doesn't delete existing fields unless explicitly done, but the seed script overwrites entire documents)

5. **Update OG image generation** (`src/app/trips/[slug]/opengraph-image.tsx`):
   - Handle coming_soon trips: add "Coming Soon" badge/text on generated OG image
   - Ensure no null access for fields that might be placeholder values on coming_soon trips

6. **Add per-trip theme colors** for new states in `src/styles/theme.css`:
   - `[data-trip-theme="goa"]`: warm coral/sunset orange
   - `[data-trip-theme="karnataka"]`: deep amber
   - `[data-trip-theme="uttarakhand"]`: forest green
   - `[data-trip-theme="maharashtra"]`: saffron
   - `[data-trip-theme="tamil-nadu"]`: temple gold
   - `[data-trip-theme="punjab"]`: mustard yellow
   (These only affect coming_soon detail pages + future published trips)

7. **Final build verification**:
   - `pnpm lint` — zero warnings
   - `pnpm build` — zero errors
   - Manual smoke test: homepage, published trip page, coming_soon trip page, admin dashboard
   - Mobile responsive check (375px, 768px, 1024px)

### Verification

- `pnpm build` passes with `published` fully removed
- No TypeScript errors anywhere
- `pnpm seed` completes
- All routes render correctly

### Exit Criteria

- `published` field completely removed from codebase
- OG images work for both published and coming_soon trips
- Theme colors defined for new states
- Zero build errors
- Ready for production deployment

### Rollback

If removal causes issues, re-add `published` as optional. But this should be safe since Step 3 already migrated all code.

---

## Invariants (checked after every step)

1. `pnpm build` passes with zero errors
2. Existing published trips render identically (no visual regression)
3. Content gating still works for logged-out users
4. Mobile layout doesn't break at 375px
5. No `console.log` in committed code
6. Firestore rules remain consistent with code queries

## Anti-Patterns to Avoid

1. **Don't remove `published` before ALL code is migrated** — dual-write both fields until Step 6
2. **Don't create a separate Firestore collection for visited states** — reuse Trip with `status: "coming_soon"`
3. **Don't make required Trip fields optional** for coming_soon trips — populate ALL required fields with real placeholder data instead
4. **Don't add phone numbers as raw text** — use `tel:` links for click-to-call
5. **Don't hardcode Google Maps URLs** — construct from `googlePlaceId`: `https://www.google.com/maps/place/?q=place_id:${googlePlaceId}`
6. **Don't over-engineer sharing** — no PDF generation, no image export. Text + links is sufficient
7. **Don't add new env vars** — all features use existing data model + API infrastructure
8. **Don't branch coming_soon in TripDetailContent** — create a separate `ComingSoonContent` component and branch in the server component (`page.tsx`)
9. **Don't forget Firestore rules** — they must be updated atomically with the code migration in Step 3

## Execution Notes

- **Steps 1 → 2 → 3 are strictly sequential** (type foundation → data → migration + UI)
- **Steps 4 and 5 run in parallel** after Step 3
- **Step 6 runs last** (cleanup after everything is working)
- **Model assignment:** Sonnet for all steps. Use Opus if architectural questions arise.
- **Each step is one PR** — self-contained, independently reviewable
- **After Step 2, run `pnpm seed`** to update Firestore with new data
- **After Step 3, deploy Firestore rules** before deploying the app code (or deploy simultaneously)
- **Merge order matters:** Step 3 must merge before Steps 4 and 5 to avoid conflicts in `TripDetailContent.tsx`
