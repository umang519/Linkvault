# CLAUDE.md

Guidance for Claude Code (and any other AI agent) working in this repository.

## Project status

This repo currently contains planning docs and a finished mobile visual design — no app code has been scaffolded yet:

- [PROJECT.md](PROJECT.md) — the full product/technical spec (source of truth for *what* to build), including §14 which documents the finished mobile design system
- [PLAN.md](PLAN.md) — the phased implementation plan (source of truth for *order* of work)
- [Mobile app design prompt/](Mobile%20app%20design%20prompt/) — the finished mobile UI, built with Claude Design (a `.dc.html` canvas + component files). Also published as an interactive artifact: https://claude.ai/code/artifact/cea428aa-582c-4b65-a8d4-852b1750516a

Before writing code, check PLAN.md for the current phase and pick up the next unchecked step. Update PLAN.md's checkboxes as work completes — it's the running status tracker for this project. Before building any screen, check [PROJECT.md](PROJECT.md) §14 and the matching `.dc.html` markup in `Mobile app design prompt/Screen.dc.html` — the design is final for v1's screen set; don't freelance a different layout, nav model, or component shape.

## What LinkVault is

A personal link manager (mobile app + API): save any URL in seconds, organize it with category/tags/status/notes, and retrieve it instantly via full-text search and combinable filters. The product thesis, from PROJECT.md: **"Save a link in seconds. Find exactly what I need later."** Every feature decision gets filtered through whether it helps saving or retrieval — resist scope creep beyond that.

## Intended architecture

```
React Native (Expo)  →  RTK Query  →  Node + Express + TypeScript  →  Prisma  →  PostgreSQL
                                                    +
                                        Metadata Service (Title / OG tags / Favicon)
```

| Layer | Choice | Why |
|---|---|---|
| Mobile | React Native + Expo | Fast iteration for a solo project |
| State | Redux Toolkit + RTK Query | Standard, low-friction data fetching/caching |
| Backend | Node.js + Express + TypeScript | Type safety end-to-end |
| Database | PostgreSQL + Prisma | Data is relational (User → Links → Category/Tags/Collections); Postgres was deliberately chosen over MongoDB for this reason — don't reintroduce a document store |
| Metadata | Separate metadata-fetching service | Decoupled from core API; scrapes title/OG tags/favicon/preview image for a pasted URL |

Expected monorepo shape once scaffolded (adjust if a different layout is chosen, but keep backend/mobile/metadata-service separated by concern):

```
/apps
  /mobile      — React Native (Expo) app
  /api         — Express + TypeScript REST API
  /metadata    — metadata-fetching service (title/OG/favicon scraping)
/packages       — shared types/config, if/when extraction is worth it
prisma/schema.prisma
```

## Mobile design system ("Modernist")

The mobile UI is fully designed — 31 screens across 7 flows, an interactive tap-through prototype, dark mode, and a component/type/color reference. Full detail: [PROJECT.md](PROJECT.md) §14. When implementing any screen, treat `Mobile app design prompt/Screen.dc.html` as the layout/copy reference and don't invent new UI patterns without a reason.

Key constraints when translating this into React Native:

- **No border-radius anywhere**, 2px rule weight for primary dividers, 1px for hairlines, a single red accent color, Archivo (weight 800) for headings — see the token table in PROJECT.md §14.2.
- **No icon set.** The design deliberately uses rank/count/rule-weight/letter-marks instead of icons (e.g. a domain's first letter in a ruled square instead of a favicon glyph). Don't introduce an icon library to fill this in.
- **Five-tab nav + floating Save block**, not the four-tab/quick-access-only shell implied by earlier drafts: Home, Search, Browse, Saved, You, plus a red "SAVE LINK" block floating bottom-right. Browse nests Categories/Collections/Tags behind a chip row; Saved nests Favorites/Status.
- **Dark mode is a token swap, not a separate design** — same geometry, inverted ground colors (PROJECT.md §14.2).
- The design already includes a Collections screen and Browse-tab slot even though Collections is V2 — reserve the nav slot, but keep the feature itself gated to Phase 2 (see PLAN.md).
- Three UX decisions are resolved (PROJECT.md §14.9): the Status screen's swipe-to-set-status gets a long-press menu fallback (accessibility — swipe alone isn't discoverable or assistive-tech-friendly); Browse defaults to Categories (Collections and Tags one chip-tap away, in that order); the Share-to-app sheet supports double-tap-to-save on an already-selected suggestion chip as a shortcut alongside, not instead of, the explicit Save button.

## Core data model

See PROJECT.md §3 for full field lists. Key relationships:

- `User` → many `Link`, many `Category` (with `parentId` for sub-categories), many `Tag`
- `Link` ←→ `Tag` via join table `LinkTag`
- `Link.status` is a workflow enum, **separate from** `Link.isFavorite` (a boolean) — these are different axes and must not be conflated in the schema or UI (see PROJECT.md §6)
- `Collection`/`CollectionLink` are V2 — don't add them to the v1 schema

## Conventions to follow

- **Status workflow** is a fixed sequence: `Unread → To Read → Reading → Read → Reference → Archived`. Treat it as an enum, not freeform text.
- **Categories** are seeded from the starter taxonomy in PROJECT.md §4 but must remain user-extensible — don't hardcode the list as the only allowed values.
- **URL normalization**: before any duplicate check or save, strip tracking params and trailing slashes so comparisons are consistent.
- **Search** must span Title, URL, Description, Tags, Notes, and Category — a search implementation that only matches Title is incomplete.
- **Filters** (Category, Tags, Status, Favorite, date range) must combine with AND semantics, and combinable filters are meant to become the "Smart Collections" mechanism later (a Collection is just a saved filter) — build the filter layer with that reuse in mind.
- **Minimize manual entry** is the top UX priority: the share-sheet flow (share a URL from another app → pre-filled Add Link sheet) and automatic metadata fetching exist specifically to avoid manual title/description typing. Don't ship an "Add Link" flow that requires typing a title/description by hand as the primary path.

## Roadmap discipline (see PROJECT.md §11 / PLAN.md)

Work strictly in phase order — do not pull later-phase features forward:

- **v1 (MVP)**: auth, link CRUD (add/edit/delete/open/favorite/notes), categories/tags/status, search/filter/sort, share-to-save mobile UX. No automatic metadata fetching, no collections, no AI.
- **V2**: automatic metadata fetching, collections, smart filters, duplicate detection, bulk ops, link health checking, bookmark import/export.
- **V3 (AI layer)**: auto-categorization and natural-language search — explicitly gated on v1 + V2 being solid first. AI augments the existing filter/search system; it does not replace it.

## Commands

`apps/mobile` is scaffolded (Expo SDK 57, TypeScript, React Navigation, Redux Toolkit + RTK Query — see below). `apps/api` and the Postgres/Prisma setup do not exist yet; record their commands here once Phase 0 reaches them.

```
cd apps/mobile
npm start            # expo start — scan the QR with Expo Go, or press a/i/w
npm run android       # expo start --android
npm run ios           # expo start --ios (macOS only)
npm run web            # expo start --web (needs react-dom + react-native-web — not installed; add if web support is wanted)
npm run typecheck      # tsc --noEmit
npm run doctor         # expo-doctor — validates config/dependency health
npx expo export --platform android   # bundles the JS to verify it builds cleanly, no device needed
```

### Mobile app structure (`apps/mobile/src/`)

```
theme/       tokens.ts (Modernist color/type tokens, PROJECT.md §14.2-14.3) + ThemeProvider.tsx (light/dark resolution)
store/       Redux store + typed hooks
api/         RTK Query base api (apiSlice.ts) — inject feature endpoints into this, don't create separate createApi() instances
types/       models.ts — client-side mirror of PROJECT.md §3; keep in sync with prisma/schema.prisma once it exists
components/  LinkRow, TabBar (ported from the .dc.html design files), ScreenContainer, PlaceholderScreen
navigation/  RootNavigator (stack) + MainTabs (5-tab bottom nav) — see the comment in RootNavigator.tsx for which
             design "screens" are separate routes vs. UI states of one route
screens/     one folder per screen group (auth, home, search, browse, save, link, saved, settings) — Home is filled
             in as a worked example; the rest are PlaceholderScreen stand-ins with a design-ref comment and a note
             on what that screen needs, ready to be built out against Mobile app design prompt/Screen.dc.html
```

Every route resolves to a real component today (the app runs end-to-end, just with placeholder screens and mock Home data) — there is no scaffolding step left before building out individual screens per PLAN.md §1.5.
