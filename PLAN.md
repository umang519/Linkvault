# LinkVault — Implementation Plan

Status tracker for building LinkVault, phased per the roadmap in [PROJECT.md](PROJECT.md) §11. Work top-to-bottom; don't start a phase before the previous one is usably complete. Check items off as they land.

## Phase 0 — Scaffolding

- [x] `apps/mobile`: Expo app (`create-expo-app`, TypeScript, blank template) — Expo SDK 57, strict TS
- [x] Redux Toolkit + RTK Query wired into the mobile app (`src/store`, `src/api/apiSlice.ts`) — points at `EXPO_PUBLIC_API_URL`/`localhost:3000` pending `apps/api`
- [x] React Navigation wired: root stack + 5-tab bottom nav, all routes resolve to a component (see [CLAUDE.md](CLAUDE.md) "Mobile app structure")
- [x] Modernist design tokens (`src/theme/tokens.ts`, `ThemeProvider.tsx`) + Archivo font loading, matching [PROJECT.md](PROJECT.md) §14.2-14.3
- [x] Shared components ported from the design: `LinkRow`, `TabBar` (§14.5)
- [x] Client-side data model mirror (`src/types/models.ts`) matching [PROJECT.md](PROJECT.md) §3
- [x] Verified: `tsc --noEmit` clean, `expo-doctor` 21/21, `expo export --platform android` bundles without error
- [x] Real dev commands recorded in [CLAUDE.md](CLAUDE.md)
- [ ] Initialize monorepo layout for the rest: `/apps/api`, `/apps/metadata` (metadata service can be stubbed until V2)
- [ ] `apps/api`: Node.js + Express + TypeScript project (tsconfig, eslint/prettier, nodemon/ts-node-dev)
- [ ] `prisma/schema.prisma` with `User`, `Link`, `Category`, `Tag`, `LinkTag` models per [PROJECT.md](PROJECT.md) §3.3 (omit `Collection`/`CollectionLink` — V2)
- [ ] Local Postgres running (Docker Compose recommended) + `.env` with `DATABASE_URL`
- [ ] `prisma migrate dev` for initial migration; seed script for the starter category taxonomy ([PROJECT.md](PROJECT.md) §4)
- [ ] Record the real API dev/test/lint/migrate commands in [CLAUDE.md](CLAUDE.md) once `apps/api` exists

**Frontend can start now** — every route in `apps/mobile` resolves to a real (if mostly placeholder) screen, themed with the Modernist tokens. Screens can be built out against `Mobile app design prompt/Screen.dc.html` immediately; they just won't have live data until `apps/api` exists (RTK Query calls will fail against `localhost:3000` until then — build screens against mock data first, same pattern as `HomeScreen.tsx`, and swap in real endpoints once the API is up).

## Phase 1 — MVP (v1)

Goal: a working save → organize → find loop, end to end, on a real device. Nothing below is optional for v1; nothing outside this list belongs in v1.

### 1.1 Auth
- [ ] `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`
- [ ] Session/JWT handling on the API; secure token storage on mobile (Expo SecureStore)
- [ ] Auth-gated API routes (all `/links`, `/categories`, `/tags` routes require a valid user)

### 1.2 Link CRUD
- [ ] `POST /links` — create (title, url, description, categoryId, tags, notes, status)
- [ ] `GET /links/:id`, `PATCH /links/:id`, `DELETE /links/:id`
- [ ] Toggle favorite (`PATCH /links/:id` favorite field, or dedicated endpoint)
- [ ] "Open URL" action on mobile (opens in browser / in-app browser)
- [ ] Notes field editable on the link detail screen

### 1.3 Organization
- [ ] Categories: CRUD with `parentId` for sub-categories; seed data from [PROJECT.md](PROJECT.md) §4, but user-creatable beyond the seed
- [ ] Tags: freeform create-on-save (no pre-defined tag list), `LinkTag` join handling
- [ ] Status field on `Link` as an enum: `Unread → To Read → Reading → Read → Reference → Archived`

### 1.4 Discovery
- [ ] `GET /links?search=` — full-text search across Title, URL, Description, Tags, Notes, Category (Postgres `tsvector`/`ILIKE`, whichever ships fastest for v1)
- [ ] Combinable filters: category, tags, status, favorite, date range — implemented as AND-composed query params, structured so this layer can be reused for Smart Collections in V2
- [ ] Sort options (e.g. newest, oldest, last opened, title A–Z)

### 1.5 Mobile UX — screens

Visual design is finished (Claude Design, "Modernist" system) — see [PROJECT.md](PROJECT.md) §14 and [Mobile app design prompt/Screen.dc.html](Mobile%20app%20design%20prompt/Screen.dc.html) for the authoritative layout of every screen below. Build against that markup; don't redesign from scratch.

- [ ] Shared components: `LinkRow` (detailed + compact), `TabBar` (5 tabs + floating Save block), letter-mark, status/tag/filter chips, bottom sheet, toast-with-undo, skeleton row — build these first since every screen composes them
- [ ] First run: Onboarding, Sign in, Sign up, Forgot password
- [ ] Home: greeting + retrieval counts (Favorites/To Read/Categories/Tags) + search field + recent feed, loading (skeleton) state, empty-library state
- [ ] Search: idle (recent searches + top tags), results (with filter-count button), no-results state, Filter & sort bottom sheet (live result count in the footer)
- [ ] Browse: defaults to Categories (count-first rows) → Category detail (sub-category chips); Collections and Tags one chip-tap away, in that order (Collections list is nav-slot-only in v1 — feature itself is Phase 2)
- [ ] Add link: URL-required form, Share-to-app sheet (with double-tap-to-save on an already-selected suggestion chip, per §14.9), in-progress/metadata-failed/invalid-URL states, duplicate-detected dialog
- [ ] Link detail (ruled meta table + Open Link as primary action), Edit link, Delete confirmation
- [ ] Saved tab: Favorites (with empty state explaining Favorite vs. Status), Status/"To read" list with swipe-to-advance **and a long-press fallback menu** with the same status options (accessibility — see §14.9)
- [ ] Settings (You tab), Offline state, Network-error state
- [ ] Dark mode: verify the token swap (PROJECT.md §14.2) renders correctly across all of the above rather than styling dark mode screen-by-screen
- [ ] Responsive check at small (375×667) and large (430×932) phone sizes, per the design's own check

### 1.6 Share-to-save flow (the make-or-break UX bet)
- [ ] Expo/RN share-extension or intent handler so LinkVault appears as a share target from other apps
- [ ] Sharing a URL pre-fills the Add Link sheet (title + URL auto-populated from the OS share payload, not typed)
- [ ] Verify end-to-end on a real device (share from YouTube/Chrome → LinkVault sheet appears pre-filled)

**Phase 1 exit criteria:** a user can register, share a link from another app straight into LinkVault, categorize/tag/set status on it, and later find it again via search or combined filters — without ever hand-typing a URL.

## Phase 2 — V2 (post-MVP enhancements)

- [ ] Automatic metadata fetching: build `apps/metadata` service (fetch title/description/favicon/OG image for a raw URL); wire into link creation so pasted/shared URLs auto-populate a rich card
- [ ] Duplicate detection: URL normalization (strip tracking params, trailing slashes) + save-time check with "Open Existing / Save Anyway" prompt
- [ ] Collections: `Collection`/`CollectionLink` models; UI to save a filter combination as a named collection (reusing the Phase 1.4 filter layer)
- [ ] Smart filters / pre-built collections (🔥 Important, ⭐ Favorites, 📚 Learning, 💼 Work References, 💰 Finance Research, 🧠 Read Later = Status: To Read)
- [ ] Bulk operations (multi-select links → bulk tag/category/status/delete)
- [ ] Link health checking (periodic job: check each link resolves; surface working/redirected/unavailable counts)
- [ ] Import browser bookmarks (HTML bookmarks file parser → bulk link creation)
- [ ] Export data (JSON/CSV export of the user's links)

## Phase 3 — V3 (AI layer)

Only start after Phase 1 and Phase 2 are both solid and in daily use — AI augments an already-working retrieval system, it doesn't substitute for one.

- [ ] Auto-categorization: given a pasted URL (+ fetched metadata), infer category/sub-category/tags; surface as an editable suggestion, not a silent auto-save
- [ ] Natural-language search: translate a query like "React videos I saved last month that I haven't watched" into the structured filter system from Phase 1.4 (category/tag/status/date-range params) rather than a free-form AI answer

## Explicitly out of scope until its phase

- No `Collection`/`CollectionLink` schema or UI before Phase 2
- No metadata-fetching service wired into save flow before Phase 2 (v1 accepts manually-entered title/description if no share-sheet metadata is available)
- No AI features before Phase 3
- No new categories/statuses invented ad hoc — extend via the taxonomy in [PROJECT.md](PROJECT.md) §4 and the fixed status enum in §6
