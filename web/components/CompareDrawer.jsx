"use client";

import ValueRing from "./ValueRing";
import { formatINR } from "@/lib/api";

const HOST_BADGE = {
  agency: { bg: "bg-agency-bg", text: "text-agency-text", label: "Agency" },
  influencer: { bg: "bg-influencer-bg", text: "text-influencer-text", label: "Influencer" },
  local: { bg: "bg-local-bg", text: "text-local-text", label: "Local" },
};

const INCLUSIONS = ["stay", "meals", "transport", "guide", "permit", "equipment"];

export default function CompareDrawer({ trips, onClose, onRemove }) {
  return (
    <div className="bg-dark-green border-t border-mid-green flex-shrink-0 overflow-x-auto">
      <div className="px-5 py-3 flex items-center justify-between border-b border-mid-green">
        <span className="text-gold font-display font-bold text-[14px]">Side-by-side comparison</span>
        <button
          onClick={onClose}
          className="bg-transparent border border-mid-green text-text-light rounded-[5px] px-[9px] py-[3px] text-[11px] cursor-pointer"
        >
          Close ×
        </button>
      </div>
      <div className="overflow-x-auto pb-2">
        <table className="border-collapse w-full" style={{ minWidth: Math.max(600, trips.length * 200 + 120) }}>
          {/* Trip names row */}
          <tbody>
            <tr>
              <td className="px-3.5 py-2.5 w-[120px]" />
              {trips.map((t) => (
                <td key={t.id} className="px-3.5 py-2.5 border-t border-mid-green">
                  <div className="text-cream font-display font-bold text-[12px] leading-snug mb-1">
                    {t.title}
                  </div>
                  <button
                    onClick={() => onRemove(t)}
                    className="text-text-muted text-[10px] bg-transparent border-none cursor-pointer px-0"
                  >
                    Remove ×
                  </button>
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-3.5 py-2.5 text-text-muted text-[10px] font-semibold uppercase tracking-[0.05em] border-t border-mid-green">Price</td>
              {trips.map((t) => (
                <td key={t.id} className="px-3.5 py-2.5 border-t border-mid-green">
                  <div className="font-display text-gold text-[16px] font-bold">{formatINR(t.price?.amount)}</div>
                  {t.price?.amount && t.duration_days && (
                    <div className="text-text-muted text-[10px]">
                      {formatINR(Math.round(t.price.amount / t.duration_days))}/day
                    </div>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-3.5 py-2.5 text-text-muted text-[10px] font-semibold uppercase tracking-[0.05em] border-t border-mid-green">Value</td>
              {trips.map((t) => (
                <td key={t.id} className="px-3.5 py-2.5 border-t border-mid-green">
                  <ValueRing score={t.scores?.value} />
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-3.5 py-2.5 text-text-muted text-[10px] font-semibold uppercase tracking-[0.05em] border-t border-mid-green">Duration</td>
              {trips.map((t) => (
                <td key={t.id} className="px-3.5 py-2.5 border-t border-mid-green text-[#D1D5DB] text-[12px]">
                  {t.duration_days} days
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-3.5 py-2.5 text-text-muted text-[10px] font-semibold uppercase tracking-[0.05em] border-t border-mid-green">Difficulty</td>
              {trips.map((t) => {
                const c = t.difficulty_level === "easy" ? "text-green" : t.difficulty_level === "challenging" ? "text-red" : "text-orange";
                return (
                  <td key={t.id} className={`px-3.5 py-2.5 border-t border-mid-green text-[12px] font-semibold capitalize ${c}`}>
                    {t.difficulty_level || "—"}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="px-3.5 py-2.5 text-text-muted text-[10px] font-semibold uppercase tracking-[0.05em] border-t border-mid-green">Host</td>
              {trips.map((t) => {
                const b = HOST_BADGE[t.host?.type] || HOST_BADGE.agency;
                return (
                  <td key={t.id} className="px-3.5 py-2.5 border-t border-mid-green">
                    <div className="text-[#D1D5DB] text-[12px] mb-1">{t.host?.name}</div>
                    <span className={`inline-flex px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${b.bg} ${b.text}`}>
                      {b.label}
                    </span>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="px-3.5 py-2.5 text-text-muted text-[10px] font-semibold uppercase tracking-[0.05em] border-t border-mid-green align-top pt-3">Includes</td>
              {trips.map((t) => (
                <td key={t.id} className="px-3.5 py-2.5 border-t border-mid-green">
                  <div className="flex flex-wrap gap-1">
                    {INCLUSIONS.map((item) => {
                      const has = t.price?.includes?.some((i) => i.toLowerCase().includes(item));
                      return (
                        <span
                          key={item}
                          className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-[3px] text-[10px] font-medium ${
                            has ? "text-green bg-green/10" : "text-red bg-red/10"
                          }`}
                        >
                          {has ? "✓" : "✗"} {item}
                        </span>
                      );
                    })}
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
