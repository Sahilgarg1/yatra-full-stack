# Trip Scraper Pipeline

Scrapes group trip listings from Indian travel agencies and operators, normalizes them using Claude (LLM), and stores structured data in PostgreSQL for comparison.

## Architecture

```
Sources (Websites)
      ↓
Scrapers (Cheerio/Axios)     ← one per source or use GenericWebsiteScraper
      ↓
Raw Text
      ↓
LLM Parser (Claude API)      ← extracts structured JSON from unstructured text
      ↓
Zod Validation + Scoring     ← value score, inclusions score
      ↓
PostgreSQL                   ← normalized trip store
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your keys
```

Required:
- `ANTHROPIC_API_KEY` — get from console.anthropic.com
- `DATABASE_URL` — PostgreSQL connection string

### 3. Initialize database
```bash
node index.js db:init
```

### 4. Run scrapers

Run all enabled sources:
```bash
node index.js run
```

Run a single source (for testing):
```bash
node index.js run:source zostel
node index.js run:source trek-the-himalayas
node index.js run:source bikat-adventures
```

Start scheduled runs (daily at 2am IST):
```bash
node index.js schedule
```

## Adding a New Source

For most sites, just add a config entry to `config/sources.js`:

```js
{
  id: "my-new-operator",
  enabled: true,
  factory: () => new GenericWebsiteScraper({
    name: "MyOperator",
    baseUrl: "https://www.myoperator.com",
    listingUrl: "https://www.myoperator.com/trips",
    linkFilter: (url) => url.includes("/trips/"),
    hostName: "My Operator",
    hostType: "agency",  // agency | influencer | local
    maxTrips: 15,
  }),
}
```

For sites that need custom logic (pagination, JavaScript rendering), create a new file in `scrapers/` extending `BaseScraper`.

## Trip Schema

Every trip is normalized to this shape before saving:

| Field | Description |
|-------|-------------|
| `title` | Trip name |
| `destination` | Primary destination |
| `region` | State/region in India |
| `host.name` | Operator name |
| `host.type` | `agency`, `influencer`, or `local` |
| `price.amount` | Price in INR |
| `price.includes` | What's included (meals, stay, transport, etc.) |
| `price.excludes` | What's not included |
| `price_tier` | `budget`, `mid`, or `premium` |
| `duration_days` | Trip length |
| `departure_dates` | Available departure dates |
| `group_size_max` | Maximum group size |
| `itinerary` | Day-by-day breakdown |
| `value_score` | Computed 0–100 score (inclusions + host / price tier) |
| `parse_confidence` | LLM confidence in the extraction (0–1) |

## Project Structure

```
trip-scraper/
├── index.js                    # CLI entrypoint
├── config/
│   ├── schema.js               # Zod schema + value score calculator
│   └── sources.js              # All scraper source configs
├── scrapers/
│   ├── base-scraper.js         # Base class
│   ├── generic-website-scraper.js  # Configurable for any site
│   ├── zostel-scraper.js       # Zostel-specific
│   └── trek-himalayas-scraper.js   # Trek The Himalayas-specific
├── parsers/
│   └── llm-parser.js           # Claude API extraction
├── pipeline/
│   ├── pipeline.js             # Orchestrator
│   └── scheduler.js            # Cron scheduler
├── db/
│   └── database.js             # PostgreSQL setup + queries
└── utils/
    └── logger.js               # Winston logger
```
