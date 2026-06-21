#!/usr/bin/env node
require("dotenv").config();

const { runAll, runOne } = require("./pipeline/pipeline");
const { initDB } = require("./db/database");
const logger = require("./utils/logger");

const [,, command, ...args] = process.argv;

async function main() {
  switch (command) {
    case "run":
      // Run all enabled sources
      logger.info("CLI: running all sources");
      await runAll();
      break;

    case "run:source":
      // Run a specific source: node index.js run:source zostel
      const sourceId = args[0];
      if (!sourceId) {
        console.error("Usage: node index.js run:source <source-id>");
        process.exit(1);
      }
      logger.info(`CLI: running source ${sourceId}`);
      await runOne(sourceId);
      break;

    case "db:init":
      // Just initialize the database schema
      await initDB();
      logger.info("Database initialized");
      break;

    case "schedule":
      // Start the scheduler (long-running process)
      require("./pipeline/scheduler");
      break;

    default:
      console.log(`
Trip Scraper Pipeline — CLI

Commands:
  node index.js run                        Run all enabled sources once
  node index.js run:source <id>            Run a single source by ID
  node index.js db:init                    Initialize database schema
  node index.js schedule                   Start scheduled runs (cron)

Enabled source IDs:
  zostel
  india-hikes
  wanderon
  justwravel
  tripoto

Disabled sources:
  the-hiking-club (DNS failure)
  trek-the-himalayas (redundant)
  bikat-adventures (redundant)

Examples:
  node index.js run:source zostel
  node index.js run:source wanderon
  node index.js run
      `);
  }

  process.exit(0);
}

main().catch((err) => {
  logger.error("Fatal error", { error: err.message });
  process.exit(1);
});
