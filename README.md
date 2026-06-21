# Yatra — India's Group Trip Comparison Platform

> Compare group trips from agencies, influencers & local guides across India.
> See exactly what's included, what's hidden, and what it's worth.

---

## What is Yatra?

Yatra aggregates group trips from Indian travel agencies, influencer-led tours, and local guides — then puts them side by side so travellers can make an informed decision. Every trip is scraped, parsed by an LLM, scored on value and inclusions, and served through a clean comparison UI.

**Neutral by design.** Not affiliated with any operator.

---

## The Product

Three pages, one clear flow:

| Page | Route | Purpose |
|---|---|---|
| Homepage | `/` | Search form, editorial articles, activity grid, trending trips |
| Compare | `/compare` | Filtered trip grid, side-by-side comparison drawer |
| Co-pilot | `/copilot` | Guardian Angel service for foreign travellers ($29 WhatsApp support) |

---

## Repository Structure

```
yatra-full-stack/
├── trip-scraper/       Node.js scraper — fetches & parses trip listings into PostgreSQL
├── trip-api/           Express REST API — serves trip data from PostgreSQL
├── web/                Next.js 16 frontend — the comparison UI
└── package.json        Root package — single command to start everything
```

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), Tailwind CSS v4, React 19 |
| API | Express 5, Node.js |
| Database | PostgreSQL |
| Scraper | Node.js, Axios, Cheerio |
| LLM Parser | Claude API (Anthropic) — `claude-sonnet-4-6` |
| Fonts | Fraunces (display, serif) + Inter (UI, sans) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL running locally
- Database named `trip_scraper`

### 1. Install dependencies

```bash
# Root (for concurrently)
npm install

# API
cd trip-api && npm install

# Web
cd web && npm install
```

### 2. Configure environment

**`trip-api/.env`**
```env
DATABASE_URL=postgresql://localhost:5432/trip_scraper
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000
```

**`trip-scraper/.env`** (only needed to run scrapers)
```env
DATABASE_URL=postgresql://localhost:5432/trip_scraper
ANTHROPIC_API_KEY=your_key_here
```

### 3. Initialise the database

```bash
cd trip-scraper && node index.js db:init
```

### 4. Run scrapers (to populate data)

```bash
cd trip-scraper

# All sources
node index.js run

# Single source
node index.js run:source zostel
node index.js run:source trek-the-himalayas
node index.js run:source bikat-adventures
```

### 5. Start everything

```bash
# From yatra-full-stack/
npm run start
```

This starts both the API (`localhost:3001`) and the web app (`localhost:3000`) in parallel via `concurrently`. Logs are colour-coded: green = API, cyan = web.

Open `http://localhost:3000` in your browser.

---

## API Reference

Base URL: `http://localhost:3001`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/trips` | List & filter trips |
| `GET` | `/trips/filters` | Available filter options with counts |
| `GET` | `/trips/:id` | Single trip detail |
| `GET` | `/trips/:id/related` | Related trips (same region or type) |
| `POST` | `/enquiries` | Submit a trip enquiry |
| `GET` | `/stats` | Platform-level stats (total trips, operators, destinations) |
| `GET` | `/health` | Health check |

### `/trips` query params

| Param | Type | Description |
|---|---|---|
| `q` | string | Full-text search (title, destination, description, region) |
| `host_type` | `agency \| influencer \| local` | Filter by host type |
| `trip_type` | string | Filter by activity type (trek, wildlife, etc.) |
| `difficulty` | `easy \| moderate \| challenging` | Filter by difficulty |
| `price_min` | number | Min price (INR) |
| `price_max` | number | Max price (INR) |
| `duration_min` | number | Min trip duration (days) |
| `duration_max` | number | Max trip duration (days) |
| `sort` | `value_score \| price_asc \| price_desc \| duration_asc` | Sort order |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (max: 50) |

### Trip object shape

```json
{
  "id": "uuid",
  "title": "Spiti Valley Winter Escape",
  "destination": "Spiti Valley",
  "region": "Himachal Pradesh",
  "duration_days": 7,
  "departure_dates": ["2025-01-10", "2025-02-14"],
  "difficulty_level": "moderate",
  "trip_type": ["trek", "road-trip"],
  "host": {
    "name": "Zostel Experiences",
    "type": "agency",
    "verified": false
  },
  "price": {
    "amount": 18500,
    "currency": "INR",
    "per_person": true,
    "includes": ["stay", "meals", "transport", "guide"],
    "excludes": ["permit", "equipment"]
  },
  "scores": {
    "value": 78,
    "inclusions": 65,
    "parse_confidence": 0.85
  },
  "cover_image_url": "https://...",
  "source_url": "https://..."
}
```

---

## Scraper Sources

| Scraper | Source |
|---|---|
| `zostel-scraper.js` | Zostel Experiences (zo-trips) |
| `trek-himalayas-scraper.js` | Trek The Himalayas |
| `generic-website-scraper.js` | Any URL via generic extraction |
| `bikat-adventures` | Bikat Adventures |

New sources can be added by extending `base-scraper.js`.

---

## Design System

| Token | Value | Usage |
|---|---|---|
| Dark green | `#1A2B1F` | Nav, hero backgrounds, dark sections |
| Mid green | `#2D4A35` | Cards inside dark sections |
| Green | `#4A7C59` | Accents, inclusion ticks, badges |
| Gold | `#F5A623` | CTAs, prices, highlights |
| Cream | `#FAFAF7` | Card backgrounds |
| Beige | `#F5F2EE` | Page background |
| Border | `#E8E0D4` | Card borders, dividers |

Fonts: **Fraunces** (serif, display headings) · **Inter** (sans, all UI text)

---

## Scoring

Each trip is scored automatically during parse:

- **Value score** (0–100): Composite of price-per-day relative to region average, number of inclusions, parse confidence, and group size.
- **Inclusions score** (0–100): How many of the standard 6 inclusions (stay, meals, transport, guide, permit, equipment) are covered.

Scores are recalculated on every scrape run.

---

## Known Issues / Next Tasks

- Price extraction often returns null for operators that show "Price on request" — LLM parser prompt needs a more aggressive extraction heuristic.
- Zostel scraper URL needs updating to `https://www.zostel.com/zo-trips`.
- `group_size_max` not extracting reliably from most sources.
- Add JoinMyTrip as a new scraper source.
- Deploy API to Railway, frontend to Vercel.
