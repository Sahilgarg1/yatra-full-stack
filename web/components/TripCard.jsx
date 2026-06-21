"use client";

import Image from "next/image";
import ValueRing from "./ValueRing";
import { formatINR } from "@/lib/api";

const HOST_BADGE = {
  agency: { bg: "bg-agency-bg", text: "text-agency-text", label: "Agency" },
  influencer: { bg: "bg-influencer-bg", text: "text-influencer-text", label: "Influencer" },
  local: { bg: "bg-local-bg", text: "text-local-text", label: "Local" },
};

const DIFF_COLOR = {
  easy: "text-green",
  moderate: "text-orange",
  challenging: "text-red",
};

const INCLUSIONS = ["stay", "meals", "transport", "guide"];

export default function TripCard({ trip, selected, onToggleCompare, onOpen }) {
  if (!trip) return null;

  const badge = HOST_BADGE[trip.host?.type] || HOST_BADGE.agency;
  const ppd =
    trip.price?.amount && trip.duration_days
      ? Math.round(trip.price.amount / trip.duration_days)
      : null;
  const nextDate = trip.departure_dates?.[0];

  const coverStyle = trip.cover_image_url
    ? {}
    : { background: "linear-gradient(135deg, #1A2B1F, #2D4A35, #4A7C59)" };

  return (
    <div
      className={`bg-cream rounded-[13px] overflow-hidden cursor-pointer transition-all ${
        selected
          ? "border-2 border-gold shadow-[0_0_0_3px_rgba(245,166,35,0.15)]"
          : "border border-border hover:border-green"
      }`}
      onClick={() => onOpen(trip)}
    >
      {/* Cover */}
      <div className="h-[110px] relative flex items-end p-[10px_12px]" style={coverStyle}>
        {trip.cover_image_url && (
          <Image
            src={trip.cover_image_url}
            alt={trip.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        )}
        <div className="relative z-10 flex-1">
          <div className="text-gold text-[9px] font-bold tracking-[0.08em] uppercase mb-0.5">
            {trip.region}
          </div>
          <div className="text-cream font-display text-[14px] font-bold leading-tight">
            {trip.destination}
          </div>
        </div>
        {/* Duration badge */}
        <div className="absolute top-[9px] left-[10px] bg-dark-green/70 rounded-[4px] px-[7px] py-[2px]">
          <span className="text-cream text-[10px] font-semibold">{trip.duration_days}D</span>
        </div>
        {/* Compare toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleCompare(trip); }}
          className={`absolute top-[9px] right-[10px] w-[24px] h-[24px] rounded-[5px] flex items-center justify-center text-[12px] font-bold cursor-pointer border-none ${
            selected ? "bg-gold text-dark-green" : "bg-white/20 text-white"
          }`}
        >
          {selected ? "✓" : "+"}
        </button>
      </div>

      {/* Body */}
      <div className="p-[11px_13px_13px]">
        <h3 className="font-display text-[13px] font-bold text-text-primary leading-[1.3] mb-1">
          {trip.title}
        </h3>
        <div className="flex items-center gap-1.5 mb-[9px]">
          <span className="text-[11px] text-text-muted">{trip.host?.name}</span>
          <span
            className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${badge.bg} ${badge.text}`}
          >
            {badge.label}
          </span>
        </div>

        {/* Price + value ring */}
        <div className="flex items-center justify-between mb-[9px]">
          <div>
            <div className="font-display text-[18px] font-bold text-text-primary">
              {formatINR(trip.price?.amount)}
            </div>
            {ppd && (
              <div className="text-[10px] text-text-light mt-0.5">{formatINR(ppd)}/day</div>
            )}
          </div>
          <ValueRing score={trip.scores?.value} />
        </div>

        {/* Inclusions */}
        <div className="flex flex-wrap gap-[3px] mb-2">
          {INCLUSIONS.map((item) => {
            const included = trip.price?.includes?.some((i) =>
              i.toLowerCase().includes(item)
            );
            return (
              <span
                key={item}
                className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[3px] text-[10px] font-medium ${
                  included ? "text-green bg-green/10" : "text-red bg-red/10"
                }`}
              >
                {included ? "✓" : "✗"} {item}
              </span>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-beige-warm text-[10px]">
          <span
            className={`font-semibold capitalize ${DIFF_COLOR[trip.difficulty_level] || "text-text-light"}`}
          >
            {trip.difficulty_level}
          </span>
          <span className="text-text-light">
            {nextDate
              ? new Date(nextDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
              : `${trip.departure_dates?.length || 0} dates`}
          </span>
        </div>
      </div>
    </div>
  );
}
