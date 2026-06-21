const { z } = require("zod");

// ─── Enums ────────────────────────────────────────────────────────────────────

const HostType = z.enum(["influencer", "agency", "local"]);
const TripSource = z.enum(["website", "instagram", "youtube", "facebook"]);
const Currency = z.enum(["INR", "USD", "EUR"]);

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const HostSchema = z.object({
  name: z.string(),
  type: HostType,
  source_url: z.string().url().optional(),
  follower_count: z.number().nullable().optional(),
  verified: z.boolean().default(false),
});

const PriceSchema = z.object({
  amount: z.number().positive(),
  currency: Currency.default("INR"),
  per_person: z.boolean().default(true),
  includes: z.array(z.string()).default([]),   // ["stay", "meals", "transport", "guide"]
  excludes: z.array(z.string()).default([]),   // ["flights", "personal expenses"]
  price_tier: z.enum(["budget", "mid", "premium"]).optional(),
});

const ItineraryDaySchema = z.object({
  day: z.number(),
  title: z.string().optional(),
  description: z.string().optional(),
  activities: z.array(z.string()).default([]),
});

// ─── Core Trip Schema ─────────────────────────────────────────────────────────

const TripSchema = z.object({
  // Identity
  trip_id: z.string().uuid().optional(),           // generated on save
  external_id: z.string().optional(),              // source's own ID if available
  source: TripSource,
  source_url: z.string().url(),

  // Core info
  title: z.string(),
  destination: z.string(),
  region: z.string().optional(),                   // "Himachal Pradesh", "Rajasthan"
  description: z.string().optional(),

  // Host
  host: HostSchema,

  // Pricing
  price: PriceSchema,

  // Dates & duration
  duration_days: z.number().int().positive(),
  departure_dates: z.array(z.string()).default([]), // ISO date strings
  booking_deadline: z.string().optional(),

  // Group
  group_size_min: z.number().int().optional(),
  group_size_max: z.number().int().optional(),
  seats_available: z.number().int().optional(),

  // Itinerary
  itinerary: z.array(ItineraryDaySchema).default([]),
  highlights: z.array(z.string()).default([]),
  difficulty_level: z.enum(["easy", "moderate", "challenging"]).optional(),
  trip_type: z.array(z.string()).default([]),       // ["trek", "cultural", "wildlife"]

  // Media
  cover_image_url: z.string().url().optional(),
  gallery_urls: z.array(z.string()).default([]),

  // Trust & scoring
  value_score: z.number().min(0).max(100).optional(),
  inclusions_score: z.number().min(0).max(100).optional(),

  // Meta
  raw_text: z.string().optional(),                 // original unstructured text
  last_scraped_at: z.string().datetime().optional(),
  scrape_status: z.enum(["raw", "parsed", "verified", "rejected"]).default("raw"),
  parse_confidence: z.number().min(0).max(1).optional(), // LLM confidence
});

// ─── Value Score Calculator ───────────────────────────────────────────────────

function calculateValueScore(trip) {
  const INCLUSIONS_MAP = {
    stay: 15,
    meals: 15,
    transport: 15,
    guide: 10,
    permit: 8,
    equipment: 7,
    insurance: 5,
  };

  const HOST_BASE = {
    agency: 60,
    influencer: 50,
    local: 40,
  };

  const PRICE_TIER_DIVISOR = {
    budget: 1,
    mid: 1.3,
    premium: 1.6,
  };

  // Inclusions score (max 100)
  const inclusionsScore = Math.min(
    100,
    trip.price.includes.reduce((sum, item) => {
      const key = item.toLowerCase();
      return sum + (INCLUSIONS_MAP[key] || 3);
    }, 0)
  );

  // Host score
  const hostBase = HOST_BASE[trip.host.type] || 40;
  const followerBonus = trip.host.follower_count
    ? Math.min(20, Math.floor(trip.host.follower_count / 10000))
    : 0;
  const hostScore = Math.min(100, hostBase + followerBonus);

  // Price tier
  const tier = trip.price.price_tier || guessPriceTier(trip.price.amount);
  const divisor = PRICE_TIER_DIVISOR[tier] || 1;

  const rawScore = (inclusionsScore * 0.6 + hostScore * 0.4) / divisor;
  const valueScore = Math.round(Math.min(100, rawScore));

  return { valueScore, inclusionsScore, hostScore };
}

function guessPriceTier(amount) {
  if (amount < 15000) return "budget";
  if (amount < 35000) return "mid";
  return "premium";
}

module.exports = { TripSchema, HostType, TripSource, calculateValueScore, guessPriceTier };
