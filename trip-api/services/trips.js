const { pool } = require("../db");

// ─── Row → API shape ──────────────────────────────────────────────────────────

function formatTrip(row) {
  return {
    id: row.id,
    title: row.title,
    destination: row.destination,
    region: row.region,
    description: row.description,
    trip_type: row.trip_type || [],
    difficulty_level: row.difficulty_level,
    highlights: row.highlights || [],
    duration_days: row.duration_days,
    departure_dates: row.departure_dates || [],
    group_size_min: row.group_size_min,
    group_size_max: row.group_size_max,
    seats_available: row.seats_available,
    host: {
      name: row.host_name,
      type: row.host_type,
      source_url: row.host_source_url,
      follower_count: row.host_follower_count ? Number(row.host_follower_count) : null,
      verified: row.host_verified,
    },
    price: {
      amount: row.price_amount ? Number(row.price_amount) : null,
      currency: row.price_currency || "INR",
      per_person: row.price_per_person,
      includes: row.price_includes || [],
      excludes: row.price_excludes || [],
      tier: row.price_tier,
    },
    cover_image_url: row.cover_image_url,
    gallery_urls: row.gallery_urls || [],
    itinerary: row.itinerary || [],
    scores: {
      value: row.value_score ? Number(row.value_score) : null,
      inclusions: row.inclusions_score ? Number(row.inclusions_score) : null,
      parse_confidence: row.parse_confidence ? Number(row.parse_confidence) : null,
    },
    source_url: row.source_url,
    source: row.source,
    last_scraped_at: row.last_scraped_at,
  };
}

// ─── List trips with filters ──────────────────────────────────────────────────

async function listTrips(params) {
  const {
    q, destination, region,
    host_type, trip_type, difficulty,
    price_min, price_max,
    duration_min, duration_max,
    sort, page, limit,
  } = params;

  const conditions = ["scrape_status != 'rejected'", "title IS NOT NULL"];
  const values = [];
  let i = 1;

  // Full-text search across title, destination, description
  if (q) {
    conditions.push(`to_tsvector('english', coalesce(title,'') || ' ' || coalesce(destination,'') || ' ' || coalesce(description,'') || ' ' || coalesce(region,'')) @@ plainto_tsquery('english', $${i})`);
    values.push(q);
    i++;
  }

  if (destination) {
    conditions.push(`destination ILIKE $${i}`);
    values.push(`%${destination}%`);
    i++;
  }

  if (region) {
    conditions.push(`region ILIKE $${i}`);
    values.push(`%${region}%`);
    i++;
  }

  if (host_type) {
    conditions.push(`host_type = $${i}`);
    values.push(host_type);
    i++;
  }

  if (trip_type) {
    conditions.push(`$${i} = ANY(trip_type)`);
    values.push(trip_type);
    i++;
  }

  if (difficulty) {
    conditions.push(`difficulty_level = $${i}`);
    values.push(difficulty);
    i++;
  }

  if (price_min !== undefined) {
    conditions.push(`price_amount >= $${i}`);
    values.push(price_min);
    i++;
  }

  if (price_max !== undefined) {
    conditions.push(`price_amount <= $${i}`);
    values.push(price_max);
    i++;
  }

  if (duration_min !== undefined) {
    conditions.push(`duration_days >= $${i}`);
    values.push(duration_min);
    i++;
  }

  if (duration_max !== undefined) {
    conditions.push(`duration_days <= $${i}`);
    values.push(duration_max);
    i++;
  }

  // Sort
  const ORDER_MAP = {
    value_score: "value_score DESC NULLS LAST",
    price_asc: "price_amount ASC NULLS LAST",
    price_desc: "price_amount DESC NULLS LAST",
    duration_asc: "duration_days ASC NULLS LAST",
    created_at: "created_at DESC",
  };
  const orderBy = ORDER_MAP[sort] || "value_score DESC NULLS LAST";

  // Pagination
  const offset = (page - 1) * limit;
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const countSql = `SELECT COUNT(*) FROM trips ${where}`;
  const dataSql = `
    SELECT * FROM trips
    ${where}
    ORDER BY ${orderBy}
    LIMIT $${i} OFFSET $${i + 1}
  `;

  const [countResult, dataResult] = await Promise.all([
    pool.query(countSql, values),
    pool.query(dataSql, [...values, limit, offset]),
  ]);

  const total = parseInt(countResult.rows[0].count);

  return {
    trips: dataResult.rows.map(formatTrip),
    pagination: {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
      has_next: page * limit < total,
      has_prev: page > 1,
    },
  };
}

// ─── Get single trip ──────────────────────────────────────────────────────────

async function getTripById(id) {
  const result = await pool.query("SELECT * FROM trips WHERE id = $1", [id]);
  if (!result.rows.length) return null;
  return formatTrip(result.rows[0]);
}

// ─── Get related trips ────────────────────────────────────────────────────────

async function getRelatedTrips(tripId, limit = 4) {
  // Find trips with same region or overlapping trip_type, excluding self
  const result = await pool.query(
    `SELECT t.* FROM trips t
     JOIN trips ref ON ref.id = $1
     WHERE t.id != $1
       AND t.scrape_status != 'rejected'
       AND t.title IS NOT NULL
       AND (
         t.region = ref.region
         OR t.trip_type && ref.trip_type
       )
     ORDER BY value_score DESC NULLS LAST
     LIMIT $2`,
    [tripId, limit]
  );
  return result.rows.map(formatTrip);
}

// ─── Get aggregated filter options ───────────────────────────────────────────

async function getFilterOptions() {
  const [regions, types, hosts] = await Promise.all([
    pool.query(
      `SELECT region, COUNT(*) as count FROM trips
       WHERE scrape_status != 'rejected' AND region IS NOT NULL
       GROUP BY region ORDER BY count DESC LIMIT 20`
    ),
    pool.query(
      `SELECT unnest(trip_type) as type, COUNT(*) as count FROM trips
       WHERE scrape_status != 'rejected'
       GROUP BY type ORDER BY count DESC`
    ),
    pool.query(
      `SELECT host_type, COUNT(*) as count FROM trips
       WHERE scrape_status != 'rejected' AND host_type IS NOT NULL
       GROUP BY host_type ORDER BY count DESC`
    ),
  ]);

  const priceStats = await pool.query(
    `SELECT MIN(price_amount) as min, MAX(price_amount) as max, AVG(price_amount) as avg
     FROM trips WHERE scrape_status != 'rejected' AND price_amount IS NOT NULL`
  );

  return {
    regions: regions.rows.map((r) => ({ value: r.region, count: parseInt(r.count) })),
    trip_types: types.rows.map((r) => ({ value: r.type, count: parseInt(r.count) })),
    host_types: hosts.rows.map((r) => ({ value: r.host_type, count: parseInt(r.count) })),
    price_range: {
      min: Math.round(priceStats.rows[0]?.min || 0),
      max: Math.round(priceStats.rows[0]?.max || 100000),
      avg: Math.round(priceStats.rows[0]?.avg || 0),
    },
  };
}

// ─── Stats for dashboard/scrape monitoring ───────────────────────────────────

async function getStats() {
  const result = await pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE scrape_status != 'rejected') AS total_trips,
      COUNT(*) FILTER (WHERE scrape_status = 'verified') AS verified_trips,
      COUNT(*) FILTER (WHERE last_scraped_at > NOW() - INTERVAL '24 hours') AS scraped_last_24h,
      COUNT(DISTINCT host_name) AS unique_operators,
      COUNT(DISTINCT destination) AS unique_destinations,
      AVG(value_score) FILTER (WHERE value_score IS NOT NULL) AS avg_value_score,
      MAX(last_scraped_at) AS last_scrape_at
    FROM trips
  `);
  return result.rows[0];
}

module.exports = { listTrips, getTripById, getRelatedTrips, getFilterOptions, getStats };
