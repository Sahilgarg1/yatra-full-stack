# Yatra Trip API

REST API serving trip data from the scraper pipeline to the Expo frontend.

## Stack
Node.js · Express · PostgreSQL · Zod

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL
node index.js
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/trips` | List & filter trips |
| `GET` | `/trips/filters` | Filter options with counts |
| `GET` | `/trips/:id` | Single trip detail |
| `GET` | `/trips/:id/related` | Related trips |
| `POST` | `/enquiries` | Submit enquiry |
| `GET` | `/stats` | Platform stats |
| `GET` | `/health` | Health check |

## GET /trips — Query Parameters

| Param | Type | Description |
|-------|------|-------------|
| `q` | string | Full-text search (title, destination, description) |
| `destination` | string | Filter by destination (partial match) |
| `region` | string | Filter by region (partial match) |
| `host_type` | enum | `agency` · `influencer` · `local` |
| `trip_type` | string | `trek` · `cultural` · `adventure` · `road-trip` · `beach` · `wildlife` |
| `difficulty` | enum | `easy` · `moderate` · `challenging` |
| `price_min` | number | Min price in INR |
| `price_max` | number | Max price in INR |
| `duration_min` | number | Min duration in days |
| `duration_max` | number | Max duration in days |
| `sort` | enum | `value_score` · `price_asc` · `price_desc` · `duration_asc` · `created_at` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 20, max: 50) |

### Example

```
GET /trips?q=spiti&host_type=agency&price_max=25000&sort=value_score
```

```json
{
  "trips": [...],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

## POST /enquiries

```json
{
  "trip_id": "uuid",
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "phone": "+919876543210",
  "message": "Is this suitable for beginners?",
  "departure_date": "2025-02-14",
  "num_travelers": 2
}
```

Response:
```json
{
  "success": true,
  "trip": { "title": "...", "host_name": "..." },
  "whatsapp_url": "https://wa.me/?text=...",
  "original_listing_url": "https://..."
}
```

## Architecture

```
trip-api/
├── index.js                  # Express app + startup
├── db.js                     # Postgres pool
├── routes/
│   ├── trips.js              # GET /trips, /trips/filters, /trips/:id, /trips/:id/related
│   ├── enquiries.js          # POST /enquiries
│   └── system.js             # GET /health, /stats
├── services/
│   ├── trips.js              # All trip query logic
│   └── enquiries.js          # Enquiry save + WhatsApp link builder
└── middleware/
    ├── validate.js            # Zod request validation
    └── errors.js             # Error handler + 404
```

## Connecting the Frontend

In your Expo project, add to `.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:3001
```

Then use `src/api/trips.js` (included in `trip-comparison-ui/api/trips.js`):
```js
import { fetchTrips, fetchTrip, submitEnquiry } from "./api/trips";

const { trips, pagination } = await fetchTrips({ q: "spiti", host_type: "agency" });
```

Use `TripComparison.api.jsx` instead of `TripComparison.jsx` — it's the same UI wired to real API calls with loading skeletons, pagination, and the enquiry form.
