const { Pool } = require("pg");
const logger = require("../utils/logger");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// ─── Schema ───────────────────────────────────────────────────────────────────

const CREATE_TABLES_SQL = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS trips (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id     TEXT,
  source          TEXT NOT NULL,
  source_url      TEXT NOT NULL UNIQUE,
  scraper         TEXT,

  -- Core
  title           TEXT,
  destination     TEXT,
  region          TEXT,
  description     TEXT,
  trip_type       TEXT[],
  difficulty_level TEXT,
  highlights      TEXT[],

  -- Host
  host_name       TEXT,
  host_type       TEXT,
  host_source_url TEXT,
  host_follower_count BIGINT,
  host_verified   BOOLEAN DEFAULT FALSE,

  -- Price
  price_amount    NUMERIC,
  price_currency  TEXT DEFAULT 'INR',
  price_per_person BOOLEAN DEFAULT TRUE,
  price_includes  TEXT[],
  price_excludes  TEXT[],
  price_tier      TEXT,

  -- Dates
  duration_days   INTEGER,
  departure_dates TEXT[],
  booking_deadline TEXT,

  -- Group
  group_size_min  INTEGER,
  group_size_max  INTEGER,
  seats_available INTEGER,

  -- Itinerary (stored as JSONB)
  itinerary       JSONB DEFAULT '[]',

  -- Media
  cover_image_url TEXT,
  gallery_urls    TEXT[],

  -- Scoring
  value_score     NUMERIC,
  inclusions_score NUMERIC,
  parse_confidence NUMERIC,

  -- Raw & meta
  raw_text        TEXT,
  scrape_status   TEXT DEFAULT 'raw',
  last_scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Full text search index
CREATE INDEX IF NOT EXISTS idx_trips_destination ON trips(destination);
CREATE INDEX IF NOT EXISTS idx_trips_host_type ON trips(host_type);
CREATE INDEX IF NOT EXISTS idx_trips_price_tier ON trips(price_tier);
CREATE INDEX IF NOT EXISTS idx_trips_scrape_status ON trips(scrape_status);
CREATE INDEX IF NOT EXISTS idx_trips_value_score ON trips(value_score DESC);
CREATE INDEX IF NOT EXISTS idx_trips_fts ON trips USING GIN (to_tsvector('english', coalesce(title,'') || ' ' || coalesce(destination,'') || ' ' || coalesce(description,'')));

-- Scrape log table
CREATE TABLE IF NOT EXISTS scrape_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id   TEXT,
  started_at  TIMESTAMPTZ DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  trips_found INTEGER DEFAULT 0,
  trips_saved INTEGER DEFAULT 0,
  errors      INTEGER DEFAULT 0,
  status      TEXT DEFAULT 'running'
);
`;

// ─── Init ─────────────────────────────────────────────────────────────────────

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(CREATE_TABLES_SQL);
    logger.info("Database schema ready");
  } finally {
    client.release();
  }
}

// ─── Save / Upsert ────────────────────────────────────────────────────────────

async function saveTrip(trip) {
  const sql = `
    INSERT INTO trips (
      source, source_url, scraper,
      title, destination, region, description, trip_type, difficulty_level, highlights,
      host_name, host_type, host_source_url, host_follower_count, host_verified,
      price_amount, price_currency, price_per_person, price_includes, price_excludes, price_tier,
      duration_days, departure_dates, booking_deadline,
      group_size_min, group_size_max, seats_available,
      itinerary,
      cover_image_url, gallery_urls,
      value_score, inclusions_score, parse_confidence,
      raw_text, scrape_status, last_scraped_at
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,
      $16,$17,$18,$19,$20,$21,
      $22,$23,$24,
      $25,$26,$27,
      $28,
      $29,$30,
      $31,$32,$33,
      $34,$35,$36
    )
    ON CONFLICT (source_url) DO UPDATE SET
      title           = EXCLUDED.title,
      destination     = EXCLUDED.destination,
      price_amount    = EXCLUDED.price_amount,
      price_includes  = EXCLUDED.price_includes,
      value_score     = EXCLUDED.value_score,
      scrape_status   = EXCLUDED.scrape_status,
      last_scraped_at = EXCLUDED.last_scraped_at,
      updated_at      = NOW()
    RETURNING id
  `;

  const h = trip.host || {};
  const p = trip.price || {};

  const values = [
    trip.source,
    trip.source_url,
    trip.scraper || null,
    trip.title || null,
    trip.destination || null,
    trip.region || null,
    trip.description || null,
    trip.trip_type || [],
    trip.difficulty_level || null,
    trip.highlights || [],
    h.name || trip.host_name || null,
    h.type || trip.host_type || null,
    h.source_url || null,
    h.follower_count || null,
    h.verified || false,
    p.amount || null,
    p.currency || "INR",
    p.per_person !== undefined ? p.per_person : true,
    p.includes || [],
    p.excludes || [],
    p.price_tier || null,
    trip.duration_days || null,
    trip.departure_dates || [],
    trip.booking_deadline || null,
    trip.group_size_min || null,
    trip.group_size_max || null,
    trip.seats_available || null,
    JSON.stringify(trip.itinerary || []),
    trip.cover_image_url || null,
    trip.gallery_urls || [],
    trip.value_score || null,
    trip.inclusions_score || null,
    trip.parse_confidence || null,
    trip.raw_text ? trip.raw_text.slice(0, 10000) : null,
    trip.scrape_status || "parsed",
    trip.last_scraped_at || new Date().toISOString(),
  ];

  const result = await pool.query(sql, values);
  return result.rows[0]?.id;
}

// ─── Scrape log helpers ───────────────────────────────────────────────────────

async function startScrapeLog(sourceId) {
  const result = await pool.query(
    "INSERT INTO scrape_logs (source_id) VALUES ($1) RETURNING id",
    [sourceId]
  );
  return result.rows[0].id;
}

async function finishScrapeLog(logId, { tripsFound, tripsSaved, errors, status }) {
  await pool.query(
    `UPDATE scrape_logs SET finished_at=NOW(), trips_found=$1, trips_saved=$2, errors=$3, status=$4
     WHERE id=$5`,
    [tripsFound, tripsSaved, errors, status, logId]
  );
}

module.exports = { initDB, saveTrip, startScrapeLog, finishScrapeLog, pool };
