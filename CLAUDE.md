# Yatra — Project Context for Claude Code

## What we're building
India's first group trip comparison platform. Aggregates trips from
agencies, influencers & local guides. Shows price, inclusions, and
a value score side by side.

## Current stack
- trip-scraper/     → Node.js scraper + Claude API LLM parser → PostgreSQL
- trip-api/         → Express REST API serving trip data
- trip-comparison-ui/ → React comparison UI (TripComparison.jsx)

## Pages designed (mockups done in Claude.ai chat)
1. Homepage (index) — hero search with 4 inputs (destination, date,
   traveler type, experience), article cards below, no nav links except
   "Get a co-pilot"
2. Compare page — 3-column trip grid, + button to add to compare bar,
   side-by-side drawer when 2+ selected
3. Co-pilot page — Guardian Angel service, $29 one-time, WhatsApp flow

## DB schema
PostgreSQL table: trips
Key columns: title, destination, region, host_name, host_type,
price_amount, price_includes[], price_excludes[], duration_days,
departure_dates[], value_score, inclusions_score, scrape_status

## API endpoints (trip-api/ running on port 3001)
GET  /trips                → list & filter trips
GET  /trips/filters        → filter options with counts
GET  /trips/:id            → single trip
GET  /trips/:id/related    → related trips
POST /enquiries            → save enquiry, return WhatsApp URL
GET  /health               → health check
GET  /stats                → platform stats

## Known issues to fix
1. Price extraction — many trips show "Price on request" instead of
   real price. Fix: update LLM parser prompt in
   trip-scraper/parsers/llm-parser.js to be more aggressive about
   extracting prices
2. Zostel scraper URL broken — change listingUrl to
   https://www.zostel.com/zo-trips in
   trip-scraper/scrapers/zostel-scraper.js
3. group_size_max not extracting — update parser prompt

## Immediate next tasks
1. Fix price + group size extraction in LLM parser
2. Add JoinMyTrip as a new scraper source
3. Build homepage (index.jsx) with the search form
4. Wire search → compare page with query params
5. Build co-pilot page with form + WhatsApp flow
6. Deploy API to Railway, frontend to Vercel

## Design tokens (used in all UI)
- Background dark: #1A2B1F
- Accent: #F5A623
- Green: #4A7C59
- Card bg: #FAFAF7
- Border: #E8E0D4
- Font: Fraunces (serif display) + Inter (UI)
