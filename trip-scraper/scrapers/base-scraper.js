const axios = require("axios");
const cheerio = require("cheerio");
const logger = require("../utils/logger");

const USER_AGENTS = [
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
];

class BaseScraper {
  constructor(name, sourceType) {
    this.name = name;
    this.sourceType = sourceType;
    this.delayMs = parseInt(process.env.REQUEST_DELAY_MS) || 2000;
    this._browser = null;
  }

  // ─── Random user-agent ──────────────────────────────────────────────────────

  randomUA() {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  }

  // ─── HTTP fetch with Axios (for simple HTML pages) ──────────────────────────

  async fetchHTML(url) {
    try {
      logger.info(`[${this.name}] Fetching`, { url });
      const response = await axios.get(url, {
        headers: {
          "User-Agent": this.randomUA(),
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        timeout: 15000,
        maxRedirects: 5,
      });
      return response.data;
    } catch (err) {
      logger.error(`[${this.name}] Fetch failed`, { url, error: err.message });
      return null;
    }
  }

  // ─── Playwright fetch (for JS-rendered SPAs) ───────────────────────────────

  async _ensureBrowser() {
    if (!this._browser) {
      const { chromium } = require("playwright");
      this._browser = await chromium.launch({ headless: true });
    }
    return this._browser;
  }

  async fetchWithPlaywright(url, opts = {}) {
    const { waitFor = "domcontentloaded", timeout = 30000, scrollWait = 2500 } = opts;
    try {
      logger.info(`[${this.name}] Playwright fetch`, { url });
      const browser = await this._ensureBrowser();
      const context = await browser.newContext({
        userAgent: this.randomUA(),
        viewport: { width: 1280, height: 800 },
      });
      const page = await context.newPage();

      await page.goto(url, { waitUntil: waitFor, timeout });
      // Wait for JS-rendered content to appear
      await page.waitForTimeout(scrollWait);

      // Scroll down to trigger lazy-loaded content
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);

      const html = await page.content();
      await context.close();
      return html;
    } catch (err) {
      logger.error(`[${this.name}] Playwright fetch failed`, { url, error: err.message });
      return null;
    }
  }

  // ─── Fetch with exponential backoff retry ──────────────────────────────────

  async fetchWithRetry(url, opts = {}) {
    const { maxRetries = 3, usePlaywright = false, ...fetchOpts } = opts;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const html = usePlaywright
        ? await this.fetchWithPlaywright(url, fetchOpts)
        : await this.fetchHTML(url);

      if (html) return html;

      if (attempt < maxRetries) {
        const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        logger.warn(`[${this.name}] Retry ${attempt}/${maxRetries} in ${Math.round(backoff)}ms`, { url });
        await this.delay(backoff);
      }
    }

    logger.error(`[${this.name}] All ${maxRetries} attempts failed`, { url });
    return null;
  }

  // ─── Close browser if open ─────────────────────────────────────────────────

  async cleanup() {
    if (this._browser) {
      await this._browser.close();
      this._browser = null;
    }
  }

  // ─── Cheerio helper ────────────────────────────────────────────────────────

  parse(html) {
    return cheerio.load(html);
  }

  extractText($, selector) {
    return $(selector).text().replace(/\s+/g, " ").trim();
  }

  // ─── Delay between requests ────────────────────────────────────────────────

  async delay(ms) {
    const wait = ms || this.delayMs;
    return new Promise((resolve) => setTimeout(resolve, wait));
  }

  // ─── Must be implemented by each scraper ───────────────────────────────────

  async scrape() {
    throw new Error(`${this.name}.scrape() must be implemented`);
  }

  // ─── Standard result wrapper ───────────────────────────────────────────────

  result(rawText, url, extra = {}) {
    return {
      raw_text: rawText,
      source_url: url,
      source: this.sourceType,
      scraped_at: new Date().toISOString(),
      scraper: this.name,
      ...extra,
    };
  }
}

module.exports = BaseScraper;
