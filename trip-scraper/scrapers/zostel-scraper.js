const BaseScraper = require("./base-scraper");
const logger = require("../utils/logger");

/**
 * Zostel Experiences / Trips Scraper
 * Uses Playwright since Zostel is a React SPA.
 * Tries multiple possible listing URLs.
 */
class ZostelScraper extends BaseScraper {
  constructor() {
    super("ZostelScraper", "website");
    this.baseUrl = "https://www.zostel.com";
    // Try multiple possible listing paths
    this.seedUrls = [
      "https://www.zostel.com/trips/",
      "https://www.zostel.com/group-trips/",
      "https://www.zostel.com/experiences/",
      "https://www.zostel.com/zostel-life/",
    ];
  }

  async scrape() {
    logger.info(`[${this.name}] Starting scrape`);
    const results = [];
    const seenUrls = new Set();

    for (const seedUrl of this.seedUrls) {
      const html = await this.fetchWithRetry(seedUrl, { usePlaywright: true, maxRetries: 2 });
      if (!html) {
        logger.warn(`[${this.name}] No content from ${seedUrl}, trying next`);
        continue;
      }

      const $ = this.parse(html);

      // Collect links that look like trip/experience detail pages
      const links = [];
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;
        const fullUrl = href.startsWith("http") ? href : `${this.baseUrl}${href}`;

        if (
          fullUrl.includes("zostel.com") &&
          !seenUrls.has(fullUrl) &&
          fullUrl !== seedUrl &&
          (fullUrl.includes("/trip/") ||
            fullUrl.includes("/trips/") ||
            fullUrl.includes("/experience/") ||
            fullUrl.includes("/experiences/") ||
            fullUrl.includes("/group-trip/") ||
            fullUrl.includes("/zostel-life/"))
        ) {
          // Skip listing pages themselves, only grab detail pages
          const path = new URL(fullUrl).pathname;
          const segments = path.split("/").filter(Boolean);
          if (segments.length >= 2) {
            seenUrls.add(fullUrl);
            links.push(fullUrl);
          }
        }
      });

      logger.info(`[${this.name}] Found ${links.length} trip links from ${seedUrl}`);
      if (links.length > 0) break; // Use first seed that yields results
    }

    // If no trip links found from any seed, try scraping the listing page content directly
    if (seenUrls.size === 0) {
      logger.warn(`[${this.name}] No detail links found, attempting to scrape listing page content`);
      for (const seedUrl of this.seedUrls) {
        const html = await this.fetchWithPlaywright(seedUrl);
        if (!html) continue;

        const $ = this.parse(html);
        $("nav, footer, script, style").remove();
        const bodyText = $("body").text().replace(/\s+/g, " ").trim();

        if (bodyText.length > 500) {
          // Try to find card-like elements
          const cards = $("[class*='card'], [class*='trip'], [class*='experience'], article, [class*='listing']");
          if (cards.length > 0) {
            cards.each((i, card) => {
              if (i >= 20) return;
              const cardText = $(card).text().replace(/\s+/g, " ").trim();
              const link = $(card).find("a").first().attr("href");
              const url = link
                ? link.startsWith("http") ? link : `${this.baseUrl}${link}`
                : `${seedUrl}#card-${i}`;

              if (cardText.length > 100) {
                const img = $(card).find("img").first().attr("src") || null;
                results.push(
                  this.result(cardText, url, {
                    cover_image_url: img,
                    host_name: "Zostel",
                    host_type: "agency",
                  })
                );
              }
            });
            if (results.length > 0) break;
          }
        }
      }

      await this.cleanup();
      logger.info(`[${this.name}] Done (listing-only mode)`, { count: results.length });
      return results;
    }

    // Fetch detail pages
    const detailUrls = Array.from(seenUrls).slice(0, 20);
    for (let i = 0; i < detailUrls.length; i++) {
      const detailUrl = detailUrls[i];
      await this.delay();

      const detailHtml = await this.fetchWithRetry(detailUrl, { usePlaywright: true, maxRetries: 2 });
      if (!detailHtml) continue;

      const $detail = this.parse(detailHtml);
      $detail("nav, footer, script, style, [class*='nav'], [class*='footer'], [class*='cookie']").remove();
      const rawText = $detail("body").text().replace(/\s+/g, " ").trim();

      if (rawText.length < 200) continue;

      const coverImage =
        $detail("meta[property='og:image']").attr("content") ||
        $detail("img[class*='hero'], img[class*='cover'], img[class*='banner']").first().attr("src") ||
        null;

      results.push(
        this.result(rawText, detailUrl, {
          cover_image_url: coverImage,
          host_name: "Zostel",
          host_type: "agency",
        })
      );

      logger.info(`[${this.name}] Scraped ${i + 1}/${detailUrls.length}`, { url: detailUrl });
    }

    await this.cleanup();
    logger.info(`[${this.name}] Done`, { count: results.length });
    return results;
  }
}

module.exports = ZostelScraper;
