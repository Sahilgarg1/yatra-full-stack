require("dotenv").config();
const cron = require("node-cron");
const { runAll } = require("./pipeline");
const logger = require("../utils/logger");

// Run every day at 2am IST (8:30pm UTC)
const CRON_SCHEDULE = process.env.CRON_SCHEDULE || "30 20 * * *";

logger.info(`Scheduler: starting, will run on schedule: ${CRON_SCHEDULE}`);

cron.schedule(CRON_SCHEDULE, async () => {
  logger.info("Scheduler: triggered scrape run");
  try {
    await runAll();
  } catch (err) {
    logger.error("Scheduler: run failed", { error: err.message });
  }
});

// Also run immediately on startup (optional — comment out if you don't want this)
(async () => {
  logger.info("Scheduler: running initial scrape on startup");
  try {
    await runAll();
  } catch (err) {
    logger.error("Scheduler: initial run failed", { error: err.message });
  }
})();
