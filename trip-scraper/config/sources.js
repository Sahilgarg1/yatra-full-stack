const ZostelScraper = require("../scrapers/zostel-scraper");
const GenericWebsiteScraper = require("../scrapers/generic-website-scraper");

/**
 * SOURCES REGISTRY
 *
 * Mix of agencies + aggregator platforms for diverse trip types.
 * Influencer-specific sites can be added later via GenericWebsiteScraper config.
 */
const SOURCES = [
  // ─── Kept agencies ──────────────────────────────────────────────────────────

  {
    id: "zostel",
    enabled: false, // Cloudflare bot protection blocks headless browsers
    factory: () => new ZostelScraper(),
  },

  {
    id: "india-hikes",
    enabled: true,
    factory: () =>
      new GenericWebsiteScraper({
        name: "IndiaHikes",
        baseUrl: "https://indiahikes.com",
        listingUrls: [
          "https://indiahikes.com",
          "https://indiahikes.com/upcoming-treks",
        ],
        listingUrl: "https://indiahikes.com",
        linkFilter: (url) => {
          if (!url.includes("indiahikes.com/")) return false;
          // Match trek detail pages: /<trek-name>-trek/ or /trek/<slug>
          if (/indiahikes\.com\/[a-z][a-z0-9-]+-trek\/?$/.test(url)) return true;
          if (/indiahikes\.com\/trek\/[a-z][a-z0-9-]+/.test(url)) return true;
          return false;
        },
        hostName: "India Hikes",
        hostType: "agency",
        maxTrips: 15,
        usePlaywright: true,
      }),
  },

  // ─── Aggregator / diverse trip platforms ─────────────────────────────────────

  {
    id: "wanderon",
    enabled: true,
    factory: () =>
      new GenericWebsiteScraper({
        name: "WanderOn",
        baseUrl: "https://wanderon.in",
        listingUrls: [
          "https://wanderon.in/india-trips",
          "https://wanderon.in/upcoming-community-trips",
          "https://wanderon.in/international-trips",
        ],
        listingUrl: "https://wanderon.in/india-trips",
        linkFilter: (url) =>
          /wanderon\.in\/trip\/[a-z]/.test(url),
        hostName: "WanderOn",
        hostType: "agency",
        maxTrips: 20,
        usePlaywright: true,
      }),
  },

  {
    id: "justwravel",
    enabled: true,
    factory: () =>
      new GenericWebsiteScraper({
        name: "JustWravel",
        baseUrl: "https://www.justwravel.com",
        listingUrls: [
          "https://www.justwravel.com/backpacking-trips",
          "https://www.justwravel.com/upcoming-trips",
          "https://www.justwravel.com/treks",
        ],
        listingUrl: "https://www.justwravel.com/backpacking-trips",
        linkFilter: (url) => {
          if (!url.includes("justwravel.com/")) return false;
          // Match detail pages: /backpacking-trips/india/<state>/<slug> or /treks/india/<state>/<slug>
          const path = url.replace(/^https?:\/\/[^/]+/, "");
          const segments = path.split("/").filter(Boolean);
          if (segments.length >= 4 &&
            (segments[0] === "backpacking-trips" || segments[0] === "treks" || segments[0] === "tour-packages")) {
            return true;
          }
          return false;
        },
        hostName: "JustWravel",
        hostType: "agency",
        maxTrips: 20,
        usePlaywright: true,
      }),
  },

  {
    id: "tripoto",
    enabled: true,
    factory: () =>
      new GenericWebsiteScraper({
        name: "Tripoto",
        baseUrl: "https://www.tripoto.com",
        listingUrls: [
          "https://www.tripoto.com/tour-packages",
        ],
        listingUrl: "https://www.tripoto.com/tour-packages",
        linkFilter: (url) => {
          if (!url.includes("tripoto.com/")) return false;
          // Match destination tour packages: /<destination>/tour-packages
          if (/tripoto\.com\/[a-z][a-z0-9-]+\/tour-packages\/?$/.test(url)) return true;
          return false;
        },
        hostName: "Tripoto",
        hostType: "agency",
        maxTrips: 15,
        usePlaywright: true,
      }),
  },

  // ─── Disabled sources ───────────────────────────────────────────────────────

  {
    id: "the-hiking-club",
    enabled: false,
    factory: () =>
      new GenericWebsiteScraper({
        name: "TheHikingClub",
        baseUrl: "https://www.thehikingclub.in",
        listingUrl: "https://www.thehikingclub.in/trips",
        linkFilter: (url) => url.includes("/trips/"),
        hostName: "The Hiking Club",
        hostType: "local",
        maxTrips: 15,
      }),
  },

  {
    id: "trek-the-himalayas",
    enabled: false,
    factory: () =>
      new GenericWebsiteScraper({
        name: "TrekTheHimalayas",
        baseUrl: "https://www.trekthehimalayas.com",
        listingUrl: "https://www.trekthehimalayas.com/upcoming-treks",
        linkFilter: (url) => url.includes("/trek/") || url.includes("/treks/"),
        hostName: "Trek The Himalayas",
        hostType: "agency",
        maxTrips: 15,
      }),
  },

  {
    id: "bikat-adventures",
    enabled: false,
    factory: () =>
      new GenericWebsiteScraper({
        name: "BikatAdventures",
        baseUrl: "https://www.bikatadventures.com",
        listingUrl: "https://www.bikatadventures.com/Home/Upcoming",
        linkFilter: (url) => url.includes("/Home/Trip/"),
        hostName: "Bikat Adventures",
        hostType: "agency",
        maxTrips: 20,
      }),
  },
];

function getEnabledSources() {
  return SOURCES.filter((s) => s.enabled);
}

function getSourceById(id) {
  return SOURCES.find((s) => s.id === id);
}

module.exports = { SOURCES, getEnabledSources, getSourceById };
