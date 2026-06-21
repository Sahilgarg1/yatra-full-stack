const BaseScraper = require("./base-scraper");
const logger = require("../utils/logger");

/**
 * Generic configurable scraper for any travel website.
 * Supports both Cheerio (static HTML) and Playwright (JS-rendered) modes.
 *
 * Usage:
 *   const scraper = new GenericWebsiteScraper({
 *     name: "WanderOn",
 *     baseUrl: "https://www.wanderon.in",
 *     listingUrl: "https://www.wanderon.in/trips",
 *     linkFilter: (url) => url.includes("/trip/"),
 *     hostName: "WanderOn",
 *     hostType: "agency",
 *     maxTrips: 20,
 *     usePlaywright: true,
 *   });
 */
class GenericWebsiteScraper extends BaseScraper {
  constructor(config) {
    super(config.name || "GenericScraper", "website");
    this.config = {
      baseUrl: config.baseUrl,
      listingUrl: config.listingUrl,
      listingUrls: config.listingUrls || [config.listingUrl],
      linkFilter: config.linkFilter || (() => true),
      hostName: config.hostName || "Unknown",
      hostType: config.hostType || "agency",
      maxTrips: config.maxTrips || 15,
      detailSelector: config.detailSelector || "body",
      usePlaywright: config.usePlaywright || false,
    };
  }

  async _fetch(url) {
    if (this.config.usePlaywright) {
      return this.fetchWithRetry(url, { usePlaywright: true, maxRetries: 2 });
    }
    return this.fetchWithRetry(url, { maxRetries: 3 });
  }

  async scrape() {
    logger.info(`[${this.name}] Starting scrape`, { urls: this.config.listingUrls });
    const results = [];
    const seenUrls = new Set();

    for (const listingUrl of this.config.listingUrls) {
      // 1. Fetch listing page
      const html = await this._fetch(listingUrl);
      if (!html) continue;

      const $ = this.parse(html);

      // 2. Collect trip detail links
      const links = [];
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;
        const fullUrl = href.startsWith("http")
          ? href
          : href.startsWith("/")
            ? `${this.config.baseUrl}${href}`
            : `${this.config.baseUrl}/${href}`;

        // Match hostname ignoring www prefix
        const baseHost = new URL(this.config.baseUrl).hostname.replace(/^www\./, "");
        const linkHost = (() => { try { return new URL(fullUrl).hostname.replace(/^www\./, ""); } catch { return ""; } })();

        if (
          this.config.linkFilter(fullUrl) &&
          !seenUrls.has(fullUrl) &&
          linkHost === baseHost
        ) {
          seenUrls.add(fullUrl);
          links.push(fullUrl);
        }
      });

      logger.info(`[${this.name}] Found ${links.length} candidate links from ${listingUrl}`);

      // 3. Scrape each detail page
      for (const url of links.slice(0, this.config.maxTrips - results.length)) {
        if (results.length >= this.config.maxTrips) break;

        await this.delay();
        const detailHtml = await this._fetch(url);
        if (!detailHtml) continue;

        const $d = this.parse(detailHtml);
        $d("nav, footer, script, style, [class*='sidebar'], [class*='cookie'], [class*='popup']").remove();

        const rawText = $d(this.config.detailSelector).text().replace(/\s+/g, " ").trim();
        if (rawText.length < 200) continue;

        const coverImage = $d("meta[property='og:image']").attr("content") || null;
        const pageTitle = $d("title").text().trim();

        results.push(
          this.result(rawText, url, {
            cover_image_url: coverImage,
            page_title: pageTitle,
            host_name: this.config.hostName,
            host_type: this.config.hostType,
          })
        );

        logger.info(`[${this.name}] Scraped`, { url, textLength: rawText.length });
      }
    }

    await this.cleanup();
    logger.info(`[${this.name}] Done`, { count: results.length });
    return results;
  }
}

module.exports = GenericWebsiteScraper;
