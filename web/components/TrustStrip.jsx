import Link from "next/link";

export default function TrustStrip() {
  return (
    <div className="bg-dark-green rounded-[14px] px-6 py-[22px] mb-12 flex items-center gap-[18px]">
      <div className="w-[42px] h-[42px] bg-mid-green rounded-[10px] flex items-center justify-center text-gold text-[18px] flex-shrink-0">
        ✦
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display text-cream text-[16px] font-bold mb-[3px]">
          Traveling to India from abroad?
        </p>
        <p className="text-text-light text-[12px] leading-[1.5]">
          Permits, local transport, UPI payments, last-minute changes — it's genuinely hard. Our
          Guardian Angel connects you with a local co-pilot on WhatsApp, 24/7.
        </p>
      </div>
      <Link
        href="/copilot"
        className="flex-shrink-0 bg-gold text-dark-green text-[12px] font-bold px-3.5 py-2 rounded-[8px] no-underline whitespace-nowrap"
      >
        Get a co-pilot →
      </Link>
    </div>
  );
}
