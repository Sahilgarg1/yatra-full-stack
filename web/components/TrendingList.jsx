import Link from "next/link";
import { formatINR } from "@/lib/api";

const HOST_BADGE = {
  agency: { bg: "bg-agency-bg", text: "text-agency-text", label: "Agency" },
  influencer: { bg: "bg-influencer-bg", text: "text-influencer-text", label: "Influencer" },
  local: { bg: "bg-local-bg", text: "text-local-text", label: "Local" },
};

const FALLBACK = [
  { title: "Kedarkantha Trek", region: "Uttarakhand", duration_days: 6, host: { type: "agency" }, price: { amount: 9500 }, scores: { value: 85 }, destination: "Uttarakhand" },
  { title: "Spiti Valley Winter", region: "Himachal Pradesh", duration_days: 7, host: { type: "agency" }, price: { amount: 14500 }, scores: { value: 78 }, destination: "Spiti Valley" },
  { title: "Andaman Scuba & Island Hop", region: "Andaman", duration_days: 5, host: { type: "local" }, price: { amount: 22000 }, scores: { value: 80 }, destination: "Andaman" },
  { title: "Rajasthan Desert Circuit", region: "Rajasthan", duration_days: 8, host: { type: "influencer" }, price: { amount: 8200 }, scores: { value: 62 }, destination: "Rajasthan" },
];

export default function TrendingList({ trips }) {
  const items = trips?.length ? trips : FALLBACK;

  return (
    <div className="flex flex-col gap-2 mb-12">
      {items.slice(0, 4).map((trip, i) => {
        const badge = HOST_BADGE[trip.host?.type] || HOST_BADGE.agency;
        return (
          <div
            key={trip.id || i}
            className="bg-cream border border-border rounded-[12px] px-4 py-[13px] flex items-center gap-3.5 cursor-pointer hover:border-green transition-colors"
          >
            <div className="font-display text-[20px] font-bold text-border w-[26px] flex-shrink-0">
              {String(i + 1).padStart(2, "0")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-semibold text-text-primary mb-0.5">
                {trip.title}
                <span
                  className={`inline-flex px-1.5 py-0.5 rounded-full text-[10px] font-semibold ml-1.5 ${badge.bg} ${badge.text}`}
                >
                  {badge.label}
                </span>
              </div>
              <div className="text-[12px] text-text-light">
                {trip.destination || trip.region} · {trip.duration_days} days
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-display text-[15px] font-bold text-text-primary">
                from {formatINR(trip.price?.amount)}
              </div>
              {trip.scores?.value && (
                <div className="text-[11px] text-text-light">value score {trip.scores.value}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
