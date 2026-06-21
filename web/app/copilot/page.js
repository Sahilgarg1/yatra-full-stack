import NavBar from "@/components/NavBar";
import CopilotForm from "@/components/CopilotForm";

export const metadata = {
  title: "Guardian Angel Co-pilot — Yatra",
  description:
    "A real local expert on WhatsApp for your India trip. Permits, payments, emergencies, and local advice — covered for $29.",
};

const FEATURES = [
  {
    emoji: "🆘",
    iconBg: "bg-agency-bg",
    title: "On-call emergency support",
    desc: "Stuck at a checkpoint? Operator cancelled last minute? Vehicle broke down at 14,000 ft? Message your co-pilot and they handle it — finding alternatives, negotiating refunds, coordinating logistics.",
  },
  {
    emoji: "💬",
    iconBg: "bg-local-bg",
    title: "Real-time local advice",
    desc: "Weather changed and you're unsure about the route? Want to know the best dhaba in Kaza that's not on Google? Ask your co-pilot — they know India the way locals do.",
  },
  {
    emoji: "📋",
    iconBg: "bg-influencer-bg",
    title: "Itinerary & permit guidance",
    desc: "Inner-line permits, Protected Area permits, forest permits — India has layers. Your co-pilot tells you exactly what you need, where to get it, and flags what your operator might have missed.",
  },
  {
    emoji: "💳",
    iconBg: "bg-red-bg",
    title: "Payment & UPI help",
    desc: "Most local operators only accept UPI or cash. Foreign cards often don't work. Your co-pilot helps you navigate payments, find ATMs that accept international cards, and avoid getting stuck.",
  },
];

const INCLUDES = [
  "WhatsApp access to your co-pilot for entire trip",
  "24/7 response — typically under 15 minutes",
  "Pre-trip briefing call (30 min) before you fly",
  "Emergency escalation to local network if needed",
  "Permit checklist customised to your itinerary",
];

const TRUST = [
  "All co-pilots are India-based locals",
  "Refund if unmatched within 4 hours",
  "No subscription — one trip, one payment",
];

export default function CopilotPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar variant="copilot" />

      {/* Hero */}
      <div className="bg-dark-green px-8 pt-[52px] pb-16">
        <div className="max-w-[580px] mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-mid-green border border-green rounded-full px-3 py-1 text-green text-[11px] font-semibold tracking-[0.05em] uppercase mb-4">
            ✦ Guardian Angel — for foreign travelers
          </div>
          <h1 className="font-display text-cream text-[34px] font-bold leading-[1.2] mb-3">
            Your personal{" "}
            <em className="text-gold not-italic">local expert</em>,<br />
            on call across India.
          </h1>
          <p className="text-text-light text-[14px] leading-[1.65] max-w-[440px]">
            India is incredible — and genuinely complex. Permits, UPI payments, last-minute route
            changes, operator disputes. We put a trusted local co-pilot in your WhatsApp, available
            whenever you need them.
          </p>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-[580px] mx-auto px-8 pt-10 pb-16 w-full">
        {/* Feature cards */}
        <div className="flex flex-col gap-3 mb-9">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-cream border border-border rounded-[12px] px-[18px] py-4 flex gap-3.5 items-start"
            >
              <div
                className={`w-10 h-10 rounded-[9px] flex items-center justify-center text-[20px] flex-shrink-0 ${f.iconBg}`}
              >
                {f.emoji}
              </div>
              <div>
                <h3 className="text-[14px] font-semibold text-text-primary mb-1">{f.title}</h3>
                <p className="text-[13px] text-text-muted leading-[1.55]">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing card */}
        <div className="bg-dark-green rounded-[14px] p-[26px] mb-7">
          <div className="flex items-start justify-between mb-[18px]">
            <div>
              <div className="font-display text-gold text-[38px] font-bold leading-none">$29</div>
              <div className="text-text-light text-[12px] mt-1">one-time · covers your full trip</div>
            </div>
            <div className="bg-gold text-dark-green rounded-full px-2.5 py-[3px] text-[11px] font-bold">
              Most popular
            </div>
          </div>
          <div className="flex flex-col gap-[9px] mb-[22px]">
            {INCLUDES.map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-[13px] text-[#D1D5DB]">
                <span className="text-green text-[14px] font-bold flex-shrink-0">✓</span>
                {item}
              </div>
            ))}
          </div>
          <a
            href="https://wa.me/919876543210?text=Hi!%20I%27m%20interested%20in%20the%20Guardian%20Angel%20co-pilot%20service."
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-gold text-dark-green text-center font-bold text-[15px] py-3.5 rounded-[10px] no-underline"
          >
            Get your co-pilot for $29 →
          </a>
          <p className="text-center text-text-muted text-[11px] mt-2">
            Secure payment · Connected on WhatsApp within 2 hours
          </p>
        </div>

        {/* Form */}
        <CopilotForm />

        {/* Trust strip */}
        <div className="flex gap-5 flex-wrap mt-6">
          {TRUST.map((t) => (
            <div key={t} className="flex items-center gap-1.5 text-[12px] text-text-light">
              <span className="text-green text-[13px]">✓</span>
              {t}
            </div>
          ))}
        </div>
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
