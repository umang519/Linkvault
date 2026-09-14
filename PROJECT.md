# LinkVault — Personal Link Manager

Project Document (v1.0)

## 1. Vision

A personal link manager to save any URL, organize it with rich metadata, and retrieve it instantly later.

**Core differentiation:** Storing URLs is trivial — browser bookmarks, Notion, Pocket, and Raindrop already do that. LinkVault's product is not "save every link," it's:

> "Save a link in seconds. Find exactly what I need later."

Every feature decision should be filtered through this lens — does it help saving or retrieval?

## 2. Problem Statement

Links today are scattered across browser history, WhatsApp messages, notes apps, and bookmarks — with no unified category, tags, status, or search across all of it. LinkVault consolidates this into one searchable, filterable vault.

## 3. Core Data Model

### 3.1 Entity Overview

```
User
 ├── Links
 │     ├── Category
 │     ├── Tags
 │     └── Collections
 └── Settings
```

### 3.2 Link Object

| Field | Description |
|---|---|
| Title | Name of the link |
| URL | The link itself |
| Description | Short summary |
| Category / Sub-category | e.g. Development → React |
| Tags | Freeform labels, e.g. `react`, `performance` |
| Source | Where it came from (YouTube, GitHub, etc.) |
| Notes | Personal notes on why it was saved |
| Favorite | Boolean |
| Status | Workflow state (see §6) |
| Created At / Updated At / Last Opened At | Timestamps |

### 3.3 Database Schema (Postgres + Prisma)

```
User
 ├── id
 ├── name
 └── email

Link
 ├── id
 ├── userId
 ├── title
 ├── url
 ├── description
 ├── favicon
 ├── previewImage
 ├── categoryId
 ├── status
 ├── isFavorite
 ├── notes
 ├── createdAt
 └── updatedAt

Category
 ├── id
 ├── userId
 ├── name
 └── parentId        (enables sub-categories)

Tag
 ├── id
 ├── userId
 └── name

LinkTag (join table)
 ├── linkId
 └── tagId

# Later (V2)
Collection
CollectionLink
```

**Why Postgres over MongoDB:** the data is inherently relational (User → Links → Category/Tags/Collections), so a relational schema with foreign keys is a better fit than a document store.

## 4. Categories (Starter Taxonomy)

Don't hardcode too rigidly — seed with these, but let users create custom categories later.

- 💻 **Development** → React, JavaScript, TypeScript, Node.js, AWS, Git, Salesforce
- 💰 **Finance** → Mutual Funds, Stocks, Tax, Insurance, Personal Finance
- 📚 **Learning** → Courses, Articles, Documentation, Books, YouTube
- 🎬 **Entertainment** → Movies, Series, Music, Games
- 🛒 **Shopping** → Products, Deals, Wishlist
- 🌐 **Other**

## 5. Search & Filters

### 5.1 Search

Full-text search must span: Title, URL, Description, Tags, Notes, Category.

Example: searching `react` should surface "React Documentation," "React Performance Guide," "React Query Tutorial," etc. — not just exact title matches.

### 5.2 Filters (combinable)

- Category
- Tags
- Status
- Favorite
- Date range (e.g. "last 30 days")

Filters should **AND** together — e.g. Development + React + YouTube + To Read → narrows to a precise subset. This filter system is the foundation for Smart Collections (§8).

## 6. Status Workflow

Distinct from Favorite — Status tracks workflow, Favorite tracks importance.

```
Unread → To Read → Reading → Read → Reference → Archived
```

Example use cases this unlocks:

- "Show me all unread React articles."
- "Show me everything saved for AWS but not yet read."

**Favorite vs. Status — different axes:**

| | Example |
|---|---|
| Favorite only | ⭐ AWS Documentation — Status: Reference |
| Status only | React Performance Article — Status: To Read |

## 7. Key UX Principle: Minimize Manual Entry

The single most important UX decision: users should never have to copy-paste a URL manually.

**Flow:** Browsing YouTube → tap Share → "Your App" → pre-filled Add Link sheet (title + URL auto-populated) → pick category/tags/status → Save.

If this friction isn't solved, adoption fails — people will just keep using browser bookmarks.

### 7.1 Automatic Metadata Fetching

When a raw URL is pasted, the backend fetches:

- Title
- Description
- Favicon
- Preview image (OG image)

This turns a bare URL into a rich card automatically, rather than requiring manual title/description entry.

### 7.2 Duplicate Detection

Normalize URLs before comparison (strip tracking params, trailing slashes, etc.). If a duplicate is found on save:

> ⚠️ This link already exists — [Open Existing] [Save Anyway]

## 8. Smart Collections (Later Feature)

Saved searches / filters exposed as named "Collections," avoiding manual folder management.

- 🔥 Important
- ⭐ Favorites
- 📚 Learning
- 💼 Work References
- 💰 Finance Research
- 🧠 Read Later = Status: "To Read" (just a saved filter)

## 9. Screens (Reference Wireframes)

### 9.1 Home Screen

- Greeting + search bar
- "+ Save Link" primary CTA
- Quick Access: ⭐ Favorites · 🕐 Recent · 📚 To Read · 📂 Categories
- Recently Added feed (card per link: icon/title, category · sub-category, relative time)

### 9.2 Categories Screen

Top-level list with counts → tap into a category to see sub-category breakdown with counts (hierarchical drill-down).

### 9.3 Link Detail Screen

URL, Category, Tags, Status, Notes, Added date, Last opened date, and actions: Open Link / Edit / Delete.

### 9.4 Add Link Sheet (Share Extension)

Pre-filled Title + URL, editable Category dropdown, Tag input, Status dropdown, Save button.

> These four sub-sections were the original text wireframes. The mobile UI has since been fully designed — see §14 for the finished visual design system and the complete 31-screen set that supersedes this section as the UI reference.

## 10. Suggested Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Mobile | React Native + Expo | Faster iteration than bare RN for a solo project |
| State | Redux Toolkit + RTK Query | Familiar tooling → focus on product, not learning curve |
| Backend | Node.js + Express + TypeScript | Type safety across the stack |
| Database | PostgreSQL + Prisma | Relational data model fits better than Mongo |
| Metadata | Separate metadata-fetching service (OG tags, favicon, title scraping) | Decoupled, easy to swap/extend |

### Architecture

```
React Native (Expo)
        │
   RTK Query
        │
        ▼
Node + Express + TypeScript
        │
     Prisma
        │
        ▼
   PostgreSQL
        +
Metadata Service
(Title / OG tags / Favicon)
```

### Share Flow

```
Mobile Share Sheet
        ↓
   URL captured
        ↓
      Backend
        ↓
 Metadata extraction
        ↓
  Category / Tags
        ↓
    PostgreSQL
        ↓
  Search / Filters
```

## 11. Roadmap

### 🟢 MVP (v1) — Ship This First

- Auth: Login, Register, Logout
- Link management: Add, Edit, Delete, Open URL, Favorite, Notes
- Organization: Categories, Tags, Status
- Discovery: Search, Filter, Sort
- Mobile UX: Share → Save to App

Resist scope creep — everything below is explicitly not v1.

### 🟡 V2 — Post-MVP Enhancements

- Automatic metadata fetching
- Collections
- Smart filters
- Duplicate detection
- Bulk operations
- Link health checking (see below)
- Import browser bookmarks
- Export data

**Link Health (V2, not V1):**

- ✓ 342 working
- ⚠️ 7 redirected
- ❌ 3 unavailable

### 🔵 V3 — AI Layer (Only After MVP + V2 Are Solid)

- Auto-categorization: paste a URL → AI infers category, sub-category, and tags automatically.
- Natural-language search: e.g. "Show me the React videos I saved last month that I haven't watched" or "Find the AWS article about EC2 deployment" → translated into a structured query against the filter system.

AI should enhance an already-working retrieval system, not substitute for one.

## 12. Naming Options (Low Priority)

LinkVault · LinkBox · LinkNest · LinkShelf · LinkHub · LinkStack · URLVault · LinkSpace · SaveIt · LinkKeeper

(Don't over-invest time here early on.)

## 13. Why This Is a Strong Portfolio Project

Building this end-to-end demonstrates:

- Mobile development (React Native/Expo)
- REST API design (Node/Express/TypeScript)
- Relational data modeling (Postgres/Prisma)
- Search & filtering implementation
- Authentication
- Deep-link / OS share-sheet integration
- Progressive AI integration (V3)

All wrapped around a single, coherent user story — not a disconnected feature list.

## 14. Mobile Design System (Implemented — "Modernist")

Full visual design for the mobile app is done, built with Claude Design as an interactive canvas.

- **Source files:** [Mobile app design prompt/](Mobile%20app%20design%20prompt/) — `LinkVault Mobile.dc.html` (the canvas: overview, tap-through prototype, all 31 screens, dark mode, responsive check, component/type/color reference), `Screen.dc.html` (every screen's markup, one component switched by state), `LinkRow.dc.html`, `TabBar.dc.html` (the two reusable components), and the `_ds/modernist-…/` design-system bundle (tokens + base styles).
- **Published artifact:** https://claude.ai/code/artifact/cea428aa-582c-4b65-a8d4-852b1750516a (interactive tap-through prototype).

### 14.1 Design principles

Flat surfaces, **zero border-radius**, 2px rule weight for primary dividers (1px for secondary), a single red accent, Archivo (weight 800) for all headings, and **no icons** — rank, count, and rule weight do the work icons usually do (e.g. a category row leads with its count, not a glyph).

Stated assumptions baked into the design: one user, one vault, no sharing (v1 scope). Geometry is iOS 390×844 with safe areas respected, checked at 375×667 (small) and 430×932 (large) — single column, 20px gutters, type scale holds across sizes.

### 14.2 Color tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `--lv-bg` | `#f3f2f2` | `#191817` | Screen background |
| `--lv-surf` | `#eae9e9` | `#242221` | Card/surface fill |
| `--lv-ink` | `#201e1d` | `#f4f2f1` | Primary text/icons |
| `--lv-mut` | `#605d5d` | `#9b9797` | Secondary text |
| `--lv-line` | `#bab6b6` | `#444141` | Hairline dividers |
| `--lv-rule` | `#201e1d` | `#f4f2f1` | Primary 2px rules |
| `--lv-acc` | `#ec3013` | `#ff563c` | Accent (brighter in dark mode to hold its weight) |
| `--lv-accw` | `#fff2ef` | `#3b1a12` | Accent wash background |
| `--lv-inv` | `#f3f2f2` | `#191817` | Text/icon on accent fill |

Dark mode is the same geometry with an inverted ground — nothing else changes.

### 14.3 Typography scale

Archivo throughout (headings weight 800): 29px screen title · 20px section · 15px link title · 13.5px body/rows · 12.5px secondary/description · 10px uppercase labels/domains/meta (tracked +0.08–0.14em).

### 14.4 Navigation model

Five tabs — **Home, Search, Browse, Saved, You** — plus a floating red "SAVE LINK" block anchored bottom-right, in thumb reach. Browse holds Categories / Collections / Tags behind one chip row; Saved holds Favorites / Status. Nothing is more than two taps deep.

### 14.5 Component inventory

Link row (detailed and compact variants — detailed is the default everywhere, compact is only for dense pickers like duplicate dialogs), letter mark (first letter of domain in a 2px-ruled square, used in place of favicons), status chip, tag chip, filter chip, count cell, search field, segmented control, toggle, bottom sheet, dialog, toast (with Undo/View actions), skeleton row (pulse animation, holds real geometry so nothing jumps), tab bar, save block, ruled meta table (label/value rows on Link Detail).

### 14.6 Screen set (31 screens, 7 groups)

1. **First run — onboarding & auth:** Onboarding (one screen, not a carousel) · Sign in (with inline error state) · Sign up (with password-strength bar) · Forgot password (confirmation replaces the form in place)
2. **Home — the library:** Home (greeting, search field, four retrieval counts — Favorites/To Read/Categories/Tags, recent feed) · Loading (skeleton) · Empty library (teaches the share-sheet habit before paste) · Saved confirmation toast
3. **Search and filter:** Search idle (recent searches with hit counts, top tags, example queries) · Results (keyboard open, filter count on the filter button) · No results (names the fields searched, offers to clear active filters) · Filter & sort sheet (category, sub-category, tags, status, date, source, favorites, sort — footer shows the resulting count live)
4. **Browse — categories, collections, tags:** Categories (count-first rows, sub-categories as one readable line) · Category detail (sub-category chips with counts, search-within, sort) · Tags (browse/search/counts/inline edit) · Collections (each shown as its rule, not a folder — "Save current filters as a collection")
5. **Saving a link:** Add link (URL is the only required, only-red field; everything else skippable) · Share to app (sheet over the host app — detected title/preview, suggested category & tags, one-tap save) · Metadata in progress (non-blocking) · Metadata failed (falls back to a required title + retry, never a dead end) · Invalid URL (suggests the corrected URL) · Duplicate detected (shows the existing link — Open Existing / Save Anyway)
6. **The link itself:** Link detail (Open Link is the widest, reddest element; metadata as a ruled table) · Edit link (same field order as Add, prefilled) · Delete confirmation (the only confirmation dialog in the app) · Status/"To read" (status chips with counts; swiping a row advances it one state)
7. **Saved, account, and failure:** Favorites (search + category chips even at 18 items) · No favorites (explains the Favorite-vs-Status distinction at the point of confusion) · Settings (profile, appearance, defaults, sync, import/export, security, about, logout) · Offline (cached count, queued saves) · Network error (reassures about data safety, offers the cached library)

### 14.7 Five core flows the design is built around

1. **Save** — Share to app → suggested category and tags → Save → toast with Undo and View
2. **Find** — Home → Search → results → Filter sheet → row → Link detail → Open link
3. **Organize** — Link detail → Edit → category, tags, status, notes → Save changes
4. **Browse** — Home → Categories → Development → sub-category chip → filter → row
5. **Duplicate** — Add link → paste an already-saved URL → open existing or save a second copy

### 14.8 Design decisions to carry into implementation

- **Status vs. Favorite stay visually separate axes** (per §6) — status renders as an uppercase chip, favorite as a small solid square mark; never merged into one indicator.
- **Filter sheet always shows the resulting count before committing** ("SHOW 14 LINKS") — the filter API should support a cheap count-only query.
- **Search states which fields it covered**, including on zero results — surface the searched-field list from the API response, don't hardcode it client-side.
- **URL normalization is shown to the user** ("Normalised · 2 params stripped") on the Add Link screen — the normalization step (§7.2) needs to report what it stripped, not just silently dedupe.
- **Metadata fetch is non-blocking** — the Add flow must let the user keep filling category/tags/notes while the metadata service call is in flight, and degrade to a required manual title on failure rather than blocking save.
- **Collections already have a screen and a Browse tab slot**, even though Collections are V2 (§8, §11) — the v1 nav shell should reserve/hide that slot rather than needing restructuring later, but the Collections *feature* (schema, saved-filter execution) stays gated to Phase 2 per PLAN.md.
- **Settings surfaces some V2/unscoped items** as design placeholders (import/export, backup & sync, a security/biometric lock) — these are shown for completeness of the shell, not a scope change; keep them non-functional or hidden until their owning phase.

### 14.9 Design questions — resolved

- **Swipe-to-status long-press fallback: yes, add it.** A swipe gesture alone isn't discoverable and doesn't work for assistive tech (VoiceOver/TalkBack don't reliably expose custom swipe actions). Long-pressing a row on the Status screen should surface the same status options as a menu/sheet. This is also consistent with Link Detail, which already states the status is tap-to-change (§14.6 group 6) — the row-level interaction should offer an equivalent non-gesture path, not just the swipe.
- **Browse default tab: Categories.** Collections and Tags stay one chip-tap away, in that order (Categories → Collections → Tags), matching the chip row already in the Categories screen design.
- **Share-sheet double-tap-to-save: yes, implement as a shortcut.** Tapping an already-selected suggested category/tag chip a second time on the Share-to-app sheet saves immediately, on top of — not instead of — the explicit "SAVE — ONE TAP" button. This fits the core UX principle in §7 (minimize manual entry): it's a small, low-risk addition on a screen already being built, not a scope or schema change, and it shortens the fastest save path even further for a suggestion the user already agrees with. Keep the explicit button as the primary, discoverable action; the double-tap is a bonus, not a replacement.
