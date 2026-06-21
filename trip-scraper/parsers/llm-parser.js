const Anthropic = require("@anthropic-ai/sdk");
const { TripSchema, calculateValueScore, guessPriceTier } = require("../config/schema");
const logger = require("../utils/logger");

let client = null;

function getClient() {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "your_anthropic_api_key_here") {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add your real API key to .env"
    );
  }
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

const SYSTEM_PROMPT = `You are a travel data extraction specialist. Your job is to extract structured trip information from raw text scraped from travel websites, Instagram captions, YouTube descriptions, and similar sources.

Extract ALL available information and return ONLY valid JSON — no markdown, no explanation, no preamble.

For fields you cannot find, use null. Never guess or hallucinate prices, dates, or locations.

Return this exact JSON shape:
{
  "title": "string - trip name",
  "destination": "string - primary destination",
  "region": "string - state/region in India (e.g. Himachal Pradesh, Rajasthan)",
  "description": "string - 1-2 sentence summary",
  "host": {
    "name": "string - operator/influencer name",
    "type": "agency | influencer | local",
    "follower_count": number | null,
    "verified": false
  },
  "price": {
    "amount": number | null,
    "currency": "INR | USD | EUR",
    "per_person": true,
    "includes": ["array of what's included - e.g. stay, meals, transport, guide"],
    "excludes": ["array of what's excluded"],
    "price_tier": "budget | mid | premium | null"
  },
  "duration_days": number | null,
  "departure_dates": ["ISO date strings - YYYY-MM-DD"],
  "booking_deadline": "ISO date string | null",
  "group_size_min": number | null,
  "group_size_max": number | null,
  "seats_available": number | null,
  "itinerary": [
    { "day": 1, "title": "string", "description": "string", "activities": ["array"] }
  ],
  "highlights": ["key trip highlights"],
  "difficulty_level": "easy | moderate | challenging | null",
  "trip_type": ["trek | cultural | wildlife | adventure | spiritual | road-trip | beach | etc"],
  "cover_image_url": "string | null",
  "parse_confidence": 0.0 to 1.0
}

For host type classification:
- "influencer": individual content creator, YouTuber, Instagrammer with followers
- "agency": registered travel company, OTA, established operator
- "local": small local operator, homestay owner, individual guide without significant social following`;

async function parseWithLLM(rawText, sourceUrl, source, retries = 3) {
  logger.info("Parsing with LLM", { source, url: sourceUrl, textLength: rawText.length });

  const anthropic = getClient();

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Extract trip data from this content scraped from ${sourceUrl}:\n\n${rawText.slice(0, 8000)}`,
          },
        ],
      });

      const raw = response.content[0].text.trim();

      // Strip any accidental markdown fences
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      // Enrich with computed fields
      if (parsed.price?.amount && !parsed.price.price_tier) {
        parsed.price.price_tier = guessPriceTier(parsed.price.amount);
      }

      // Compute value score
      if (parsed.price && parsed.host) {
        const tripForScoring = {
          price: { includes: parsed.price.includes || [], price_tier: parsed.price.price_tier, amount: parsed.price.amount },
          host: { type: parsed.host.type, follower_count: parsed.host.follower_count },
        };
        const { valueScore, inclusionsScore } = calculateValueScore(tripForScoring);
        parsed.value_score = valueScore;
        parsed.inclusions_score = inclusionsScore;
      }

      // Attach metadata
      parsed.source_url = sourceUrl;
      parsed.source = source;
      parsed.raw_text = rawText.slice(0, 5000);
      parsed.last_scraped_at = new Date().toISOString();
      parsed.scrape_status = "parsed";

      // Validate with Zod
      const validated = TripSchema.safeParse(parsed);
      if (!validated.success) {
        logger.warn("Schema validation warnings", { errors: validated.error.issues.slice(0, 3) });
      }

      logger.info("Parse successful", {
        title: parsed.title,
        destination: parsed.destination,
        price: parsed.price?.amount,
        confidence: parsed.parse_confidence,
        valueScore: parsed.value_score,
      });

      return parsed;
    } catch (err) {
      const isRateLimit = err.status === 429 || err.error?.type === "rate_limit_error";
      const isOverloaded = err.status === 529;

      if ((isRateLimit || isOverloaded) && attempt < retries) {
        const backoff = Math.pow(2, attempt) * 2000 + Math.random() * 1000;
        logger.warn(`LLM rate limited, retrying in ${Math.round(backoff)}ms`, {
          attempt,
          url: sourceUrl,
        });
        await new Promise((r) => setTimeout(r, backoff));
        continue;
      }

      logger.error("LLM parse failed", {
        error: err.message,
        url: sourceUrl,
        attempt,
        status: err.status,
      });
      return null;
    }
  }

  return null;
}

module.exports = { parseWithLLM };
