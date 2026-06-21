const BaseScraper = require("./base-scraper");
const logger = require("../utils/logger");

/**
 * Trek The Himalayas Scraper
 * One of India's most popular trekking agencies
 */
class TrekHimalayasScraper extends BaseScraper {
  constructor() {
    super("TrekHimalayasScraper", "website");
    this.baseUrl = "https://www.trekthehimalayas.com";

    // Seed URLs — upcoming group treks listing pages
    this.seedUrls = [
      "https://www.trekthehimalayas.com/upcoming-treks",
      "https://www.trekthehimalayas.com/treks",
    ];
  }

  async scrape() {
    logger.info(`[${this.name}] Starting scrape`);
    const results = [];
    const seenUrls = new Set();

    for (const seedUrl of this.seedUrls) {
      const html = await this.fetchHTML(seedUrl);
      if (!html) continue;

      const $ = this.parse(html);

      // Collect detail page links
      const links = [];
      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href) return;
        const fullUrl = href.startsWith("http") ? href : `${this.baseUrl}${href}`;
        // Only follow links that look like trek detail pages
        if (
          fullUrl.includes(this.baseUrl) &&
          (fullUrl.includes("/trek/") || fullUrl.includes("/treks/") || fullUrl.includes("/upcoming")) &&
          !seenUrls.has(fullUrl)
        ) {
          seenUrls.add(fullUrl);
          links.push(fullUrl);
        }
      });

      logger.info(`[${this.name}] Found ${links.length} trek links from ${seedUrl}`);

      for (const url of links.slice(0, 15)) {
        await this.delay();
        const detailHtml = await this.fetchHTML(url);
        if (!detailHtml) continue;

        const $d = this.parse(detailHtml);
        $d("nav, footer, script, style").remove();

        const rawText = $d("body").text().replace(/\s+/g, " ").trim();
        const coverImage = $d("meta[property='og:image']").attr("content") || null;

        results.push(
          this.result(rawText, url, {
            cover_image_url: coverImage,
            host_name: "Trek The Himalayas",
            host_type: "agency",
          })
        );

        logger.info(`[${this.name}] Scraped`, { url });
      }
    }

    logger.info(`[${this.name}] Done`, { count: results.length });
    return results;
  }
}

module.exports = TrekHimalayasScraper;
