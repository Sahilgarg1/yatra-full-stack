# Yatra — Architecture

This document explains how the three parts of the system are connected and how data flows through them.

---

## Bird's-eye view

```
                          ┌─────────────────────────────────┐
                          │         Browser / User           │
                          └────────────┬────────────────────┘
                                       │ HTTP
                                       ▼
                          ┌─────────────────────────────────┐
                          │     Next.js 16   (port 3000)    │
                          │         web/                    │
                          │                                 │
                          │  /          → Homepage          │
                          │  /compare   → Trip grid         │
                          │  /copilot   → Guardian Angel    │
                          │                                 │
                          │  /api/*  ──── rewrite ────────► │──┐
                          └─────────────────────────────────┘  │
                                                               │ HTTP proxy
                          ┌─────────────────────────────────┐  │
                          │    Express API   (port 3001)    │◄─┘
                          │        trip-api/                │
                          │                                 │
                          │  GET  /trips                    │
                          │  GET  /trips/filters            │
                          │  GET  /trips/:id                │
                          │  GET  /stats                    │
                          │  POST /enquiries                │
                          └──────────────┬──────────────────┘
                                         │ pg (node-postgres)
                                         ▼
                          ┌─────────────────────────────────┐
                          │   PostgreSQL   (port 5432)      │
                          │   database: trip_scraper        │
                          │   table: trips + enquiries      │
                          └──────────────▲──────────────────┘
                                         │ INSERT / UPSERT
                          ┌─────────────────────────────────┐
                          │    Scraper Pipeline             │
                          │       trip-scraper/             │
                          │                                 │
                          │  Websites → Axios+Cheerio       │
                          │         → Raw text              │
                          │         → Claude API (LLM)      │
                          │         → Zod validation        │
                          │         → Score calculation     │
                          │         → PostgreSQL upsert     │
                          └──────────────┬──────────────────┘
                                         │ HTTP
                                         ▼
                          ┌─────────────────────────────────┐
                          │   Travel Websites / Sources     │
                          │                                 │
                          │  Zostel · Trek the Himalayas    │
                          │  Bikat Adventures · etc.        │
                          └─────────────────────────────────┘
```

---

## 1. Scraper Pipeline (`trip-scraper/`)

### Purpose
Fetches raw HTML from travel operator websites, extracts structured trip data using Claude, validates it with Zod, scores it, and upserts into PostgreSQL.

### Flow

```
node index.js run
       │
       ▼
pipeline/runner.js
       │
       ├── scrapers/zostel-scraper.js
       ├── scrapers/trek-himalayas-scraper.js
       ├── scrapers/generic-website-scraper.js
       │         (extends base-scraper.js)
       │
       │   Each scraper:
       │   1. Fetches listing page → extracts individual trip URLs
       │   2. Fetches each trip page → extracts raw text + images
       │
       ▼
parsers/llm-parser.js
       │
       │   Sends raw text to Claude API
       │   System prompt instructs Claude to return structured JSON:
       │   title, destination, region, host, price, dates,
       │   inclusions, itinerary, difficulty, trip_type, etc.
       │
       ▼
config/schema.js  (Zod validation)
       │
       │   Validates LLM output shape
       │   Calculates value_score and inclusions_score
       │   Rejects trips below confidence threshold
       │
       ▼
db/upsert.js
       │
       │   UPSERT on source_url (unique constraint)
       │   Sets scrape_status: 'raw' → 'verified' | 'rejected'
       │
       ▼
PostgreSQL: trips table
```

### Scoring

| Score | Formula |
|---|---|
| `inclusions_score` | Count of [stay, meals, transport, guide, permit, equipment] included ÷ 6 × 100 |
| `value_score` | Weighted composite: price-per-day vs. region average (40%) + inclusions_score (35%) + parse_confidence (15%) + group_size bonus (10%) |

### Running scrapers

```bash
cd trip-scraper
node index.js db:init          # create tables (first time only)
node index.js run              # all sources
node index.js run:source zostel
node index.js schedule         # cron: daily at 2am IST
```

---

## 2. API (`trip-api/`)

### Purpose
Exposes the PostgreSQL data over HTTP. Handles filtering, full-text search, pagination, and enquiry storage.

### File structure

```
trip-api/
├── index.js              App entry — wires middleware, routes, starts server
├── db.js                 pg Pool singleton
├── routes/
│   ├── trips.js          GET /trips, /trips/filters, /trips/:id, /trips/:id/related
│   ├── enquiries.js      POST /enquiries
│   └── system.js         GET /health, GET /stats
├── services/
│   ├── trips.js          SQL queries — listTrips, getTripById, getFilterOptions, getStats
│   └── enquiries.js      SQL queries — saveEnquiry, initEnquiries
└── middleware/
    ├── validate.js       Zod request validation
    └── errors.js         404 + global error handler
```

### Key design decisions

- **Full-text search** on `GET /trips?q=` uses PostgreSQL `to_tsvector` across title, destination, description, and region — no Elasticsearch needed at this scale.
- **`/trips/filters` must be declared before `/:id`** in the router to prevent Express treating "filters" as an ID param.
- **Rate limiting** (100 req/min) via `express-rate-limit`.
- **CORS** whitelist via `ALLOWED_ORIGINS` env var — defaults to `http://localhost:3000`.

### Environment

```env
DATABASE_URL=postgresql://localhost:5432/trip_scraper
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
```

---

## 3. Frontend (`web/`)

### Purpose
Server-rendered Next.js app. Homepage fetches stats + trending on the server. Compare page fetches trips client-side (interactive filters). Co-pilot page is fully static.

### File structure

```
web/
├── app/
│   ├── layout.js           Root layout — Fraunces + Inter fonts, metadata
│   ├── globals.css         Tailwind v4 @theme tokens (colours, fonts)
│   ├── page.js             Homepage — async Server Component
│   ├── compare/
│   │   └── page.js         Compare — thin server wrapper, passes searchParams
│   └── copilot/
│       └── page.js         Co-pilot — static Server Component
├── components/
│   ├── NavBar.jsx          Shared nav (variant prop: default | copilot)
│   ├── HeroSearch.jsx      ← client  Search form (3 inputs → /compare)
│   ├── ArticleGrid.jsx     Hardcoded 5 editorial articles
│   ├── TrustStrip.jsx      Guardian Angel promo strip
│   ├── ActivityGrid.jsx    ← client  12 activity chips → /compare?q=X
│   ├── TrendingList.jsx    Top 4 trips by value_score (passed from server)
│   ├── CompareClient.jsx   ← client  All compare page state & logic
│   ├── TripCard.jsx        ← client  Individual trip card + compare toggle
│   ├── ValueRing.jsx       SVG circular score meter
│   ├── CompareDrawer.jsx   ← client  Side-by-side comparison table
│   └── CopilotForm.jsx     ← client  Form → POST /api/enquiries → WhatsApp
├── lib/
│   └── api.js              Server-side fetch helpers (getStats, getTrending)
└── next.config.mjs         Rewrites: /api/* → localhost:3001/*
```

### Rendering strategy

| Route | Strategy | Why |
|---|---|---|
| `/` | Server Component, `revalidate: 3600` | Stats + trending can be stale for an hour |
| `/compare` | Dynamic (request-time) | `searchParams` must be read per request |
| `/copilot` | Static | No dynamic data |

### API proxy

`next.config.mjs` rewrites all `/api/*` requests to the Express API:

```js
rewrites() {
  return [{ source: "/api/:path*", destination: "http://localhost:3001/:path*" }]
}
```

This means:
- Server components fetch from `http://localhost:3001` directly (server-to-server, no CORS)
- Client components fetch from `/api/trips` (same origin, no CORS) → proxied to Express

### State flow on Compare page

```
URL: /compare?q=Ladakh&date=Aug 2025&days=7
          │
          ▼
  page.js (server) — awaits searchParams, passes q/date/days as props
          │
          ▼
  CompareClient (client) — mounts with initialQ="Ladakh"
          │
          ├── on mount: fetch /api/trips?q=Ladakh&sort=value_score
          │
          ├── user changes filter → re-fetch with new params
          │
          ├── user clicks "+" on card → selectedTrips state (max 4)
          │
          ├── 2+ selected → CompareBar appears at bottom
          │
          └── "Compare side by side" → CompareDrawer slides up
```

---

## 4. Database Schema

### `trips` table

| Column | Type | Description |
|---|---|---|
| `id` | uuid | Primary key |
| `source_url` | text (unique) | URL scraped from — used for upsert dedup |
| `source` | text | Source name (zostel, trek-himalayas, etc.) |
| `title` | text | Trip name |
| `destination` | text | Primary destination |
| `region` | text | State / region in India |
| `host_name` | text | Operator / influencer name |
| `host_type` | text | `agency`, `influencer`, or `local` |
| `price_amount` | numeric | Price in INR (null = price on request) |
| `price_includes` | text[] | What's included (stay, meals, transport, guide…) |
| `price_excludes` | text[] | What's excluded |
| `duration_days` | integer | Trip length in days |
| `departure_dates` | text[] | ISO date strings of departures |
| `difficulty_level` | text | `easy`, `moderate`, `challenging` |
| `trip_type` | text[] | Activity tags (trek, wildlife, road-trip…) |
| `value_score` | numeric | Calculated value score 0–100 |
| `inclusions_score` | numeric | Inclusions score 0–100 |
| `parse_confidence` | numeric | LLM confidence 0.0–1.0 |
| `scrape_status` | text | `raw`, `verified`, `rejected` |
| `itinerary` | jsonb | Day-by-day itinerary array |
| `cover_image_url` | text | Hero image |
| `last_scraped_at` | timestamptz | Last scrape timestamp |

**Indexes:** GIN full-text index on title+destination+description, B-tree on host_type, value_score (DESC), destination, scrape_status, price_tier.

### `enquiries` table

Stores trip enquiries and co-pilot signups. Foreign key to `trips.id` (nullable — co-pilot enquiries have no specific trip).

---

## 5. How a search request travels end-to-end

```
User types "Ladakh" and clicks "Compare trips →"

1. HeroSearch.jsx (client)
   → router.push("/compare?q=Ladakh")

2. Browser navigates to /compare?q=Ladakh

3. Next.js server renders page.js
   → awaits searchParams → extracts q="Ladakh"
   → renders <CompareClient initialQ="Ladakh" />

4. HTML sent to browser
   → React hydrates CompareClient

5. CompareClient useEffect fires
   → fetch("/api/trips?q=Ladakh&sort=value_score&limit=18")

6. Next.js rewrite intercepts /api/*
   → forwards to http://localhost:3001/trips?q=Ladakh&sort=value_score&limit=18

7. Express routes/trips.js → services/trips.js
   → SQL: WHERE to_tsvector(...) @@ plainto_tsquery('english', 'Ladakh')
   → ORDER BY value_score DESC
   → returns { trips: [...], pagination: {...} }

8. CompareClient renders TripCard grid

9. User clicks "+" on two cards
   → selectedTrips state grows to 2
   → CompareBar appears at bottom of screen

10. User clicks "Compare side by side →"
    → drawerOpen = true
    → CompareDrawer renders side-by-side table from in-memory selectedTrips
    (no extra API call — data is already loaded)
```

---

## 6. Starting the system

```bash
cd yatra-full-stack
npm run start
```

`concurrently` runs two processes:

| Process | Command | Output prefix |
|---|---|---|
| API | `npm run dev --prefix trip-api` → `node index.js` | `[api]` green |
| Web | `npm run dev --prefix web` → `next dev` | `[web]` cyan |

Ctrl+C kills both.

**To run scrapers** (separate terminal, separate process):
```bash
cd trip-scraper
node index.js run
```
