const express = require("express");
const router = express.Router();
const { validateQuery, TripListQuerySchema } = require("../middleware/validate");
const { listTrips, getTripById, getRelatedTrips, getFilterOptions } = require("../services/trips");

// GET /trips
// Search and filter all trips
router.get("/", validateQuery(TripListQuerySchema), async (req, res, next) => {
  try {
    const result = await listTrips(req.validatedQuery);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /trips/filters
// Returns available filter options with counts (regions, types, host types, price range)
// Must come BEFORE /:id to avoid "filters" being treated as an ID
router.get("/filters", async (req, res, next) => {
  try {
    const options = await getFilterOptions();
    res.json(options);
  } catch (err) {
    next(err);
  }
});

// GET /trips/:id
// Single trip detail
router.get("/:id", async (req, res, next) => {
  try {
    const trip = await getTripById(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trip not found" });
    res.json(trip);
  } catch (err) {
    next(err);
  }
});

// GET /trips/:id/related
// Related trips (same region or trip type)
router.get("/:id/related", async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 4, 12);
    const trips = await getRelatedTrips(req.params.id, limit);
    res.json({ trips });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
