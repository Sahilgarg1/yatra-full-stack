const { pool } = require("../db");

// Create the enquiries table (called on startup)
const CREATE_ENQUIRIES_SQL = `
CREATE TABLE IF NOT EXISTS enquiries (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id         UUID REFERENCES trips(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  message         TEXT,
  departure_date  TEXT,
  num_travelers   INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_enquiries_trip_id ON enquiries(trip_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries(created_at DESC);
`;

async function initEnquiries() {
  await pool.query(CREATE_ENQUIRIES_SQL);
}

// Save enquiry to DB and return contact info for the trip's host
async function createEnquiry(data) {
  const { trip_id, name, email, phone, message, departure_date, num_travelers } = data;

  // Save to DB
  await pool.query(
    `INSERT INTO enquiries (trip_id, name, email, phone, message, departure_date, num_travelers)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [trip_id, name, email, phone || null, message || null, departure_date || null, num_travelers || null]
  );

  // Fetch trip + host contact info
  const tripResult = await pool.query(
    "SELECT title, host_name, host_source_url, source_url FROM trips WHERE id = $1",
    [trip_id]
  );

  if (!tripResult.rows.length) {
    return { success: true, contact: null };
  }

  const trip = tripResult.rows[0];

  // Build WhatsApp pre-fill message (for operators with a phone number in the future)
  const waMessage = encodeURIComponent(
    `Hi, I found your trip "${trip.title}" on Yatra and I'm interested in joining.\n\nName: ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ""}${departure_date ? `\nPreferred departure: ${departure_date}` : ""}${num_travelers ? `\nTravelers: ${num_travelers}` : ""}${message ? `\n\nMessage: ${message}` : ""}`
  );

  return {
    success: true,
    trip: {
      title: trip.title,
      host_name: trip.host_name,
      source_url: trip.source_url,
      host_source_url: trip.host_source_url,
    },
    // WhatsApp link — operator's phone to be set per listing in future
    whatsapp_url: `https://wa.me/?text=${waMessage}`,
    // Fallback: link to the original listing
    original_listing_url: trip.source_url,
  };
}

// Recent enquiries (for admin use)
async function listEnquiries({ page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const result = await pool.query(
    `SELECT e.*, t.title as trip_title, t.host_name
     FROM enquiries e
     LEFT JOIN trips t ON t.id = e.trip_id
     ORDER BY e.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

module.exports = { initEnquiries, createEnquiry, listEnquiries };
