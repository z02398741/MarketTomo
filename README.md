# MarketTomo

**AI Market Research Companion** — search, track, and analyze the Japanese
market from one tech-forward dashboard.

> AI × Space × Market Analytics

---

## Features

- **Dashboard** — overview of tracked markets, signals, and AI insights.
- **Search (V1, live)** — real-time product search against the **Rakuten
  Ichiba** marketplace, presented in a *Cosmic Space* UI (deep-space backdrop,
  twinkling starfield, glass cards, purple→pink glow). No mock data — results
  come straight from the Rakuten API.
- **Tracking** — monitor markets, competitors, and signals (UI scaffold).
- **Settings** — workspace, profile, and notification preferences.

The search layer is **platform-agnostic**: every result is normalized to a
`Product` shape with a `platform` field, so Amazon / Mercari / Yahoo Shopping
can be added later without touching the UI or API contract.

---

## Tech Stack

| Area      | Choice                                  |
| --------- | --------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack)      |
| Language  | TypeScript (strict)                     |
| Styling   | Tailwind CSS v4                         |
| UI        | shadcn/ui (`base-nova`, base-ui)        |
| Theming   | next-themes (dark mode)                 |
| Backend   | Route Handlers (`app/api/*`)            |
| Data      | Rakuten Ichiba Item Search API          |
| Planned   | Supabase, Zod, React Hook Form          |

Server Components are the default; client components are used only where
interactivity is required (search, theme toggle, sidebar).

---

## Getting Started

### 1. Install

```bash
npm install
```

### 2. Configure environment

Create a `.env.local` (already present with a placeholder) and add your
Rakuten Application ID:

```bash
# .env.local
RAKUTEN_APP_ID=your_rakuten_application_id
```

Get an Application ID from **[Rakuten Developers](https://webservice.rakuten.co.jp/)**
(アプリ ID発行). It is required for `/api/search` to return real products.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), go to **/search**, and
try a keyword such as `抱枕` to fetch live Rakuten products.

---

## Search Flow

```
User keyword
   ↓
/search (client)
   ↓  fetch
GET /api/search?keyword=...   ← Route Handler
   ↓
Rakuten Ichiba Item Search API
   ↓
normalized Product[] + stats  → rendered as cosmic product grid
```

### Product shape

```ts
interface Product {
  id: string
  title: string
  price: number
  image: string
  shop: string
  reviewCount: number
  reviewAverage: number
  itemUrl: string
  platform: "rakuten" | "amazon" | "mercari" | "yahoo"
}
```

`GET /api/search` also returns aggregate stats (count, average / min / max
price) used by the search result header.

---

## Project Structure

```
app/
  (app)/                 # authenticated app shell (sidebar + header)
    page.tsx             # Dashboard
    search/page.tsx      # Cosmic Space search experience
    tracking/page.tsx
    settings/page.tsx
  api/
    search/route.ts      # Rakuten-backed search endpoint
  layout.tsx             # root: fonts, theme provider, toaster
  globals.css            # design tokens + Cosmic Space theme
components/
  app-shell.tsx          # responsive shell (desktop sidebar + mobile drawer)
  app-sidebar.tsx
  search/                # starfield, search experience, product card
  ui/                    # shadcn primitives
lib/
  types.ts               # Product / Platform / search types
  rakuten.ts             # Rakuten API client + mapper
  nav.ts                 # sidebar navigation config
```

---

## Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start the dev server         |
| `npm run build` | Production build             |
| `npm run start` | Serve the production build   |
| `npm run lint`  | Run ESLint                   |

---

## Roadmap

- [ ] Live tracking with Supabase persistence
- [ ] Additional platforms (Amazon, Mercari, Yahoo Shopping)
- [ ] Save / follow products (`加入追蹤`)
- [ ] AI-generated market summaries

---

> **Note:** This project targets the locally installed Next.js (v16), whose
> APIs may differ from older releases. See `AGENTS.md` and the bundled docs in
> `node_modules/next/dist/docs/` before making framework-level changes.
