"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch() {
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [month, setMonth] = useState("");
  const [days, setDays] = useState("");

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("q", destination);
    if (month) params.set("date", month);
    if (days) params.set("days", days);
    router.push(`/compare?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSearch} className="bg-mid-green rounded-2xl p-5 mt-9">
      <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr] gap-2.5 mb-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-text-light text-[10px] font-semibold tracking-[0.07em] uppercase pl-0.5">
            Where do you want to go?
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Spiti Valley, Ladakh, Meghalaya…"
            className="bg-dark-green border border-white/10 rounded-[10px] px-[14px] py-[11px] text-cream text-sm outline-none focus:border-gold placeholder:text-[#4B5563] w-full"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-text-light text-[10px] font-semibold tracking-[0.07em] uppercase pl-0.5">
            When?
          </label>
          <input
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="e.g. Aug 2025"
            className="bg-dark-green border border-white/10 rounded-[10px] px-[14px] py-[11px] text-cream text-sm outline-none focus:border-gold placeholder:text-[#4B5563] w-full"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-text-light text-[10px] font-semibold tracking-[0.07em] uppercase pl-0.5">
            How many days?
          </label>
          <input
            type="number"
            min="1"
            max="30"
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="e.g. 7"
            className="bg-dark-green border border-white/10 rounded-[10px] px-[14px] py-[11px] text-cream text-sm outline-none focus:border-gold placeholder:text-[#4B5563] w-full"
          />
        </div>
      </div>
      <button
        type="submit"
        className="w-full bg-gold text-dark-green rounded-[10px] py-[13px] text-[15px] font-bold cursor-pointer"
      >
        Compare trips →
      </button>
    </form>
  );
}
