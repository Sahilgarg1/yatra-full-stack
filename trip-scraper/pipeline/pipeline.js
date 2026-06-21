require("dotenv").config();
const { getEnabledSources, getSourceById } = require("../config/sources");
const { parseWithLLM } = require("../parsers/llm-parser");
const { initDB, saveTrip, startScrapeLog, finishScrapeLog } = require("../db/database");
const logger = require("../utils/logger");

// ─── Run pipeline for a single source ────────────────────────────────────────

async function runSource(sourceConfig) {
  const { id, factory } = sourceConfig;
  const scraper = factory();
  const logId = await startScrapeLog(id);

  let tripsFound = 0;
  let tripsSaved = 0;
  let errors = 0;

  try {
    logger.info(`Pipeline: starting source`, { id });

    // 1. Scrape raw content (browser cleanup handled inside scraper)
    const rawResults = await scraper.scrape();
    tripsFound = rawResults.length;
    logger.info(`Pipeline: scraped ${tripsFound} raw results`, { id });

    // 2. Parse each result with LLM
    for (const raw of rawResults) {
      try {
        const parsed = await parseWithLLM(raw.raw_text, raw.source_url, raw.source);
        if (!parsed) {
          errors++;
          continue;
        }

        // Carry over any scraper-provided fields (host hints, cover image, etc.)
        if (raw.cover_image_url && !parsed.cover_image_url) {
          parsed.cover_image_url = raw.cover_image_url;
        }
        if (raw.host_name && !parsed.host?.name) {
          parsed.host = parsed.host || {};
          parsed.host.name = raw.host_name;
        }
        if (raw.host_type && !parsed.host?.type) {
          parsed.host = parsed.host || {};
          parsed.host.type = raw.host_type;
        }
        parsed.scraper = raw.scraper;

        // 3. Save to DB
        const savedId = await saveTrip(parsed);
        if (savedId) {
          tripsSaved++;
          logger.info(`Pipeline: saved trip`, { id: savedId, title: parsed.title });
        }

        // Rate limit LLM calls
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        errors++;
        logger.error(`Pipeline: error processing result`, { url: raw.source_url, error: err.message });
      }
    }
  } catch (err) {
    logger.error(`Pipeline: source failed`, { id, error: err.message });
    errors++;
  } finally {
    // Ensure browser is closed even if scrape() threw
    if (scraper.cleanup) await scraper.cleanup().catch(() => {});
  }

  await finishScrapeLog(logId, {
    tripsFound,
    tripsSaved,
    errors,
    status: errors === tripsFound ? "failed" : errors > 0 ? "partial" : "success",
  });

  logger.info(`Pipeline: source complete`, { id, tripsFound, tripsSaved, errors });
  return { tripsFound, tripsSaved, errors };
}

// ─── Run all enabled sources ──────────────────────────────────────────────────

async function runAll() {
  logger.info("Pipeline: starting full run");
  await initDB();

  const sources = getEnabledSources();
  logger.info(`Pipeline: ${sources.length} sources enabled`);

  const results = {};
  const maxConcurrent = parseInt(process.env.MAX_CONCURRENT_SCRAPERS) || 2;

  // Run in batches to avoid overwhelming target servers
  for (let i = 0; i < sources.length; i += maxConcurrent) {
    const batch = sources.slice(i, i + maxConcurrent);
    const batchResults = await Promise.allSettled(batch.map((s) => runSource(s)));

    batchResults.forEach((result, idx) => {
      const sourceId = batch[idx].id;
      if (result.status === "fulfilled") {
        results[sourceId] = result.value;
      } else {
        results[sourceId] = { error: result.reason?.message };
        logger.error(`Pipeline: source batch error`, { sourceId, error: result.reason?.message });
      }
    });

    // Gap between batches
    if (i + maxConcurrent < sources.length) {
      logger.info("Pipeline: batch complete, pausing before next batch");
      await new Promise((r) => setTimeout(r, 5000));
    }
  }

  const total = Object.values(results).reduce(
    (acc, r) => ({
      found: acc.found + (r.tripsFound || 0),
      saved: acc.saved + (r.tripsSaved || 0),
      errors: acc.errors + (r.errors || 0),
    }),
    { found: 0, saved: 0, errors: 0 }
  );

  logger.info("Pipeline: full run complete", total);
  return results;
}

// ─── Run a single source by ID ────────────────────────────────────────────────

async function runOne(sourceId) {
  await initDB();
  const sourceConfig = getSourceById(sourceId);
  if (!sourceConfig) throw new Error(`Source not found: ${sourceId}`);
  return runSource(sourceConfig);
}

module.exports = { runAll, runOne };
