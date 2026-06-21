const ARTICLES = [
  {
    id: 1,
    featured: true,
    category: "Expose",
    catClass: "bg-red-bg text-[#A32D2D]",
    bg: "#1A2B1F",
    overlay: { label: "Spiti Valley · Price breakdown", text: "₹18,500 vs ₹22,000 — same route, very different story" },
    title: "The hidden fees in Indian group tours: what ₹18,500 actually buys vs ₹22,000",
    desc: "One Spiti trip costs Rs 3,500 less — but excludes inner-line permits, a guide, and one night's stay. The cheaper trip ends up costing Rs 7,200 more on the road.",
    meta: "6 min · Pricing analysis",
  },
  {
    id: 2,
    category: "Expose",
    catClass: "bg-red-bg text-[#A32D2D]",
    bg: "#162218",
    title: "Why do Ladakh operators hide the cost of oxygen cans?",
    desc: "Altitude sickness is common above 11,000 ft. Here's what agencies quietly leave out.",
    meta: "4 min · Ladakh",
  },
  {
    id: 3,
    category: "Deep dive",
    catClass: "bg-influencer-bg text-influencer-text",
    bg: "#1A1A2E",
    title: "Influencer trips vs agencies: who actually delivers?",
    desc: "We compared 40 trips across 8 destinations. The results were surprising.",
    meta: "8 min · Industry analysis",
  },
  {
    id: 4,
    category: "Guide",
    catClass: "bg-agency-bg text-agency-text",
    bg: "#0D1F0F",
    title: "The foreigner's honest guide to booking group trips in India",
    desc: "Permits, UPI, scams, WhatsApp-only operators. Everything travel blogs skip.",
    meta: "10 min · Foreign travelers",
  },
  {
    id: 5,
    category: "Pricing",
    catClass: "bg-local-bg text-local-text",
    bg: "#1F1200",
    title: "JustWravel, Zostel, Bikat: who gives you most for your money?",
    desc: "Top 3 budget agencies compared on 6 metrics across 12 destinations.",
    meta: "7 min · Agency comparison",
  },
];

export default function ArticleGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-12">
      {ARTICLES.map((a) => (
        <article
          key={a.id}
          className={`bg-cream border border-border rounded-[14px] overflow-hidden cursor-pointer hover:border-green transition-colors${a.featured ? " sm:col-span-2" : ""}`}
        >
          <div
            className={`relative ${a.featured ? "h-[160px]" : "h-[110px]"}`}
            style={{ background: a.bg }}
          >
            <span
              className={`absolute top-3 right-3 inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-[0.05em] uppercase ${a.catClass}`}
            >
              {a.category}
            </span>
            {a.overlay && (
              <div className="absolute bottom-0 left-0 right-0 px-3.5 py-3">
                <div className="text-gold text-[10px] font-bold tracking-[0.08em] uppercase mb-1">
                  {a.overlay.label}
                </div>
                <div className="text-cream font-display text-[13px] leading-[1.4]">
                  {a.overlay.text}
                </div>
              </div>
            )}
          </div>
          <div className="px-[15px] py-[13px] pb-[15px]">
            <h3
              className={`font-display font-bold text-text-primary leading-[1.3] mb-1.5 ${a.featured ? "text-[18px]" : "text-[15px]"}`}
            >
              {a.title}
            </h3>
            <p className="text-[12px] text-text-muted leading-[1.55] mb-2">{a.desc}</p>
            <p className="text-[11px] text-text-light">{a.meta}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
