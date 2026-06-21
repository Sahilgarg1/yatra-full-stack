const { z } = require("zod");

// Wraps a Zod schema and validates req.query, returning 400 on failure
function validateQuery(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid query parameters",
        details: result.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      });
    }
    req.validatedQuery = result.data;
    next();
  };
}

// Wraps a Zod schema and validates req.body, returning 400 on failure
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: "Invalid request body",
        details: result.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      });
    }
    req.validatedBody = result.data;
    next();
  };
}

// ─── Query schemas ────────────────────────────────────────────────────────────

const TripListQuerySchema = z.object({
  // Search
  q: z.string().max(200).optional(),
  destination: z.string().max(100).optional(),
  region: z.string().max(100).optional(),

  // Filters
  host_type: z.enum(["agency", "influencer", "local"]).optional(),
  trip_type: z.string().max(50).optional(),        // e.g. "trek"
  difficulty: z.enum(["easy", "moderate", "challenging"]).optional(),

  // Price
  price_min: z.coerce.number().min(0).optional(),
  price_max: z.coerce.number().max(500000).optional(),

  // Duration
  duration_min: z.coerce.number().int().min(1).optional(),
  duration_max: z.coerce.number().int().max(365).optional(),

  // Sorting
  sort: z.enum(["value_score", "price_asc", "price_desc", "duration_asc", "created_at"]).default("value_score"),

  // Pagination
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const EnquiryBodySchema = z.object({
  trip_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  message: z.string().max(1000).optional(),
  departure_date: z.string().optional(),
  num_travelers: z.coerce.number().int().min(1).max(100).optional(),
});

module.exports = { validateQuery, validateBody, TripListQuerySchema, EnquiryBodySchema };
