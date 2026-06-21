const express = require("express");
const router = express.Router();
const { ping } = require("../db");
const { getStats } = require("../services/trips");

// GET /health
router.get("/health", async (req, res) => {
  try {
    await ping();
    res.json({ status: "ok", db: "connected", ts: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: "error", db: "disconnected", message: err.message });
  }
});

// GET /stats
// Platform-level numbers — total trips, operators, destinations, etc.
router.get("/stats", async (req, res, next) => {
  try {
    const stats = await getStats();
    res.json({
      total_trips: parseInt(stats.total_trips),
      verified_trips: parseInt(stats.verified_trips),
      scraped_last_24h: parseInt(stats.scraped_last_24h),
      unique_operators: parseInt(stats.unique_operators),
      unique_destinations: parseInt(stats.unique_destinations),
      avg_value_score: stats.avg_value_score ? Math.round(Number(stats.avg_value_score)) : null,
      last_scrape_at: stats.last_scrape_at,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
