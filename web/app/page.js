import NavBar from "@/components/NavBar";
import HeroSearch from "@/components/HeroSearch";
import ArticleGrid from "@/components/ArticleGrid";
import TrustStrip from "@/components/TrustStrip";
import ActivityGrid from "@/components/ActivityGrid";
import TrendingList from "@/components/TrendingList";
import { getStats, getTrending } from "@/lib/api";

export default async function HomePage() {
  const [stats, trending] = await Promise.all([getStats(), getTrending()]);

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />

      {/* Hero */}
      <div className="bg-dark-green px-4 sm:px-8 pt-[52px] pb-[72px]">
        <div className="max-w-[640px] mx-auto">
          <div className="text-green text-[11px] font-semibold tracking-[0.1em] uppercase mb-3.5">
            India&apos;s trip comparison engine
          </div>
          <h1 className="font-display text-cream text-[28px] sm:text-[40px] font-bold leading-[1.15] mb-3.5">
            Stop guessing.<br />Start{" "}
            <em className="text-gold not-italic">comparing</em>.
          </h1>
          <p className="text-text-light text-[14px] sm:text-[15px] leading-[1.65] mb-9 max-w-[480px]">
            We track group trips from agencies, influencers &amp; local guides — then show you exactly
            what each one includes, what it hides, and what it&apos;s worth.
          </p>
          <HeroSearch />
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-beige-dark py-3 px-4 sm:px-8 flex flex-wrap justify-center gap-6 sm:gap-12">
        <div className="text-center min-w-[72px]">
          <div className="font-display text-gold text-[19px] font-bold">
            {stats?.total_trips ? `${stats.total_trips}+` : "340+"}
          </div>
          <div className="text-green text-[11px] font-medium mt-0.5">trips tracked</div>
        </div>
        <div className="text-center min-w-[72px]">
          <div className="font-display text-gold text-[19px] font-bold">
            {stats?.unique_operators ?? "28"}
          </div>
          <div className="text-green text-[11px] font-medium mt-0.5">operators compared</div>
        </div>
        <div className="text-center min-w-[72px]">
          <div className="font-display text-gold text-[19px] font-bold">
            {stats?.unique_destinations ?? "18"}
          </div>
          <div className="text-green text-[11px] font-medium mt-0.5">destinations</div>
        </div>
        <div className="text-center min-w-[72px]">
          <div className="font-display text-gold text-[19px] font-bold">₹5k–₹48k</div>
          <div className="text-green text-[11px] font-medium mt-0.5">price range</div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-[704px] mx-auto px-4 sm:px-8 pt-12 w-full">
        {/* Articles */}
        <div className="flex items-baseline justify-between mb-[22px]">
          <h2 className="font-display text-[22px] font-bold text-text-primary">
            What operators don&apos;t tell you
          </h2>
          <button className="text-[13px] text-green bg-transparent border-none cursor-pointer">
            All articles →
          </button>
        </div>
        <ArticleGrid />

        {/* Guardian Angel trust strip */}
        <TrustStrip />

        {/* Browse by activity */}
        <div className="flex items-baseline justify-between mb-[22px]">
          <h2 className="font-display text-[22px] font-bold text-text-primary">Browse by activity</h2>
          <button className="text-[13px] text-green bg-transparent border-none cursor-pointer">
            See all →
          </button>
        </div>
        <ActivityGrid />

        {/* Trending */}
        <div className="flex items-baseline justify-between mb-[22px]">
          <h2 className="font-display text-[22px] font-bold text-text-primary">Trending this season</h2>
          <button className="text-[13px] text-green bg-transparent border-none cursor-pointer">
            View all →
          </button>
        </div>
        <TrendingList trips={trending} />
      </main>

      {/* Footer */}
      <footer className="bg-dark-green px-8 py-7 mt-auto text-center">
        <div className="flex items-center justify-center gap-[7px]">
          <span className="text-gold text-[15px]">◈</span>
          <span className="text-cream font-display font-bold text-[14px]">yatra</span>
        </div>
        <p className="text-text-muted text-[12px] mt-2">
          Comparing group trips across India · Not affiliated with any operator · Neutral by design
        </p>
      </footer>
    </div>
  );
}
