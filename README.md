# MarketTomo

**AI Market Research Companion** — search, track, and analyse the Japanese
e-commerce market from one tech-forward dashboard.

> AI × Space × Market Analytics

---

## Features

| Area | Status | Description |
|---|---|---|
| **Dashboard** | ✅ Live | Stats overview — platform count, monthly searches, tracked items |
| **Search** | ✅ Live | Multi-platform product search with AI keyword expansion |
| **Tracking** | ✅ Live | Add / remove products, persisted locally (+ optional Supabase) |
| **Settings** | ✅ Live | Profile, workspace, and notification preferences |

### Search

- Searches **4 platforms in parallel**: Rakuten Ichiba (REST API), Amazon.co.jp, Mercari, and Yahoo Shopping (HTML parsers with JSON-LD / `__NEXT_DATA__` extraction)
- Results are deduplicated, merged, and sorted by review count
- Filter by individual platform via chips in the UI
- **AI keyword expansion** (optional) — powered by Google Gemini; suggests related search terms via `POST /api/keywords`
- Monthly search counter tracked in localStorage (1,000/month soft cap)

### Tracking

- Toggle tracking from any product card (+ / ✓ button)
- Tracked products persisted to `localStorage` and synced to Supabase when configured
- Tracking page shows a sortable table of saved products with external links

### Settings

- **Profile** tab — name, email, role (initials shown as avatar)
- **Workspace** tab — workspace name, default region
- **Notifications** tab — toggle alerts, weekly digest, product updates

---

## Tech Stack

| Area | Choice |
|---|---|
| Framework | Next.js 16.2.9 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 |
| UI components | shadcn/ui (`base-nova`) + Base UI |
| Theming | next-themes (dark mode) |
| Notifications | Sonner |
| AI | Google Gemini 2.5 Flash (pluggable via `AI_PROVIDER`) |
| Database | Supabase (optional; falls back to localStorage) |
| ORM / forms | Zod 4 + React Hook Form |

Server Components are the default; `"use client"` is used only where
interactivity is required (search, tracking, settings form, sidebar).

---

## Getting Started

### 1. Install

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in the values you need:

```bash
cp .env.example .env.local
```

```bash
# .env.local

# ── Required for search ──────────────────────────────────────────────────────
# Rakuten Item Search API (get one at https://webservice.rakuten.co.jp/)
RAKUTEN_APP_ID=your_rakuten_application_id

# ── AI keyword expansion (optional) ─────────────────────────────────────────
GEMINI_API_KEY=          # https://aistudio.google.com/apikey
# GEMINI_MODEL=gemini-2.5-flash
# AI_PROVIDER=gemini

# ── Supabase persistence (optional) ─────────────────────────────────────────
# Run supabase/migrations/001_tracked_items.sql first.
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Only `RAKUTEN_APP_ID` is required for full search functionality. Everything
else degrades gracefully when omitted.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Architecture

### Search flow

```
User keyword
  ↓
/search (client)  →  POST /api/search   { keyword, platform? }
                           ↓
              Promise.allSettled([
                searchRakuten(keyword),   ← Rakuten Item Search API
                searchAmazon(keyword),    ← HTML scraper / JSON-LD
                searchMercari(keyword),   ← __NEXT_DATA__ extractor
                searchYahoo(keyword),     ← JSON-LD / __NEXT_DATA__
              ])
                           ↓
              dedupe → sort by reviewCount → Product[]
                           ↓
                  rendered as cosmic product grid
```

Each crawler is independent; a single platform failure returns `[]` and
does not block the others (`Promise.allSettled`).

### AI keyword flow

```
User keyword
  ↓
POST /api/keywords  { keyword }
  ↓
Gemini 2.5 Flash  →  string[]  (related search terms)
```

Returns `[]` when `GEMINI_API_KEY` is not set (graceful no-op).

### Tracking flow

```
ProductCard + button
  ↓
TrackingContext.toggleTracking(product)
  ↓
localStorage ("markettomo:tracked", "markettomo:tracked-products")
  ↓ [if Supabase configured]
POST /api/tracking  or  DELETE /api/tracking?id=...
  ↓
tracked_items table (Supabase)
```

---

## Product shape

```ts
interface Product {
  id: string            // "{platform}-{shopCode}-{itemCode}"
  title: string
  price: number         // JPY
  image: string
  shop: string
  reviewCount: number
  reviewAverage: number
  itemUrl: string
  platform: "rakuten" | "amazon" | "mercari" | "yahoo"
}
```

---

## Project Structure

```
app/
  (app)/                      # app shell (sidebar + header)
    layout.tsx                # wraps SettingsProvider + TrackingProvider + AppShell
    page.tsx                  # Dashboard
    search/page.tsx           # Search experience
    tracking/page.tsx         # Tracking table + stats
    settings/page.tsx         # Settings tabs
  api/
    search/route.ts           # Multi-platform search endpoint
    keywords/route.ts         # AI keyword expansion endpoint
    tracking/route.ts         # GET / POST / DELETE tracked items (Supabase)
  layout.tsx                  # Root: fonts, ThemeProvider, Toaster
  globals.css                 # Design tokens + Cosmic Space theme

components/
  app-shell.tsx               # Responsive shell (desktop sidebar + mobile drawer)
  app-sidebar.tsx             # Nav, search quota progress bar
  settings-context.tsx        # SettingsProvider + useSettings()
  tracking-context.tsx        # TrackingProvider + useTracking()
  dashboard/
    dashboard-stats.tsx       # Stat cards (dynamic from tracking + search stats)
  search/
    search-experience.tsx     # Search bar, platform chips, results grid
    product-card.tsx          # Product card with track toggle
    starfield.tsx             # Animated CSS starfield background
  settings/
    settings-form.tsx         # Tabbed profile / workspace / notifications form
  tracking/
    tracking-table.tsx        # Tracked products table with remove action
    tracking-stats.tsx        # Per-platform count badges

lib/
  types.ts                    # Product, Platform, SearchResult types
  platforms.ts                # PLATFORM_LABELS + ACTIVE_PLATFORMS (single source)
  settings.ts                 # AppSettings, loadSettings(), saveSettings(), getInitials()
  search-stats.ts             # Monthly search counter (localStorage)
  nav.ts                      # Sidebar navigation config
  supabase-server.ts          # createSupabaseServerClient() (RSC / Route Handlers)
  supabase-browser.ts         # createSupabaseBrowserClient() (client components)
  utils.ts                    # cn() helper

services/
  crawler/
    rakuten.ts                # Rakuten Item Search API client
    amazon.ts                 # Amazon.co.jp HTML scraper
    mercari.ts                # Mercari __NEXT_DATA__ extractor
    yahoo.ts                  # Yahoo Shopping JSON-LD / __NEXT_DATA__ extractor
    index.ts                  # Crawler registry + crawl() dispatcher
  ai/
    gemini.ts                 # Gemini API client
    keywords.ts               # Keyword expansion logic
    provider.ts               # AI provider interface
    registry.ts               # Provider registry (pluggable)
    index.ts                  # expandKeywords() public API

supabase/
  migrations/
    001_tracked_items.sql     # tracked_items table + RLS policy
```

---

## API Reference

### `POST /api/search`

```json
{ "keyword": "抱枕", "platform": "rakuten" }
```

`platform` is optional; omit to search all active platforms. Returns 400 for
unknown platform values.

**Response**
```json
{
  "success": true,
  "total": 42,
  "products": [ /* Product[] */ ]
}
```

### `POST /api/keywords`

```json
{ "keyword": "抱枕" }
```

**Response**
```json
{ "keywords": ["クッション", "枕カバー", "抱き枕"] }
```

Returns `{ "keywords": [] }` when `GEMINI_API_KEY` is not configured.

### `GET /api/tracking`

Returns all tracked items. Responds 503 when Supabase is not configured.

### `POST /api/tracking`

```json
{ "product": { /* Product */ } }
```

### `DELETE /api/tracking?id=rakuten-xxx-yyy`

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## Adding a Platform

1. Create `services/crawler/<platform>.ts` — export `search<Platform>(keyword: string): Promise<Product[]>`
2. Add the platform key to `Platform` in `lib/types.ts`
3. Add the label to `PLATFORM_LABELS` and the key to `ACTIVE_PLATFORMS` in `lib/platforms.ts`
4. Register the crawler in `services/crawler/index.ts` `crawlers` map

The search API, UI filter chips, and tracking table all derive from `ACTIVE_PLATFORMS` — no other changes needed.

---

> **Note:** This project targets Next.js v16, whose APIs may differ from
> earlier releases. Read the relevant guide in `node_modules/next/dist/docs/`
> before making framework-level changes. See `AGENTS.md` for additional notes.
