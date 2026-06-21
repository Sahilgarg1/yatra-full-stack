"use client";

import { useRouter } from "next/navigation";

const ACTIVITIES = [
  { emoji: "🧗", name: "Trekking", count: "140+ trips" },
  { emoji: "🤿", name: "Scuba Diving", count: "24 trips" },
  { emoji: "⛷", name: "Skiing", count: "18 trips" },
  { emoji: "🧘", name: "Yoga & Wellness", count: "32 trips" },
  { emoji: "🏄", name: "Surfing", count: "14 trips" },
  { emoji: "🚵", name: "Mountain Biking", count: "22 trips" },
  { emoji: "🛶", name: "River Rafting", count: "38 trips" },
  { emoji: "🦁", name: "Wildlife Safari", count: "45 trips" },
  { emoji: "🏕", name: "Camping", count: "56 trips" },
  { emoji: "🪂", name: "Paragliding", count: "16 trips" },
  { emoji: "🧗", name: "Rock Climbing", count: "12 trips" },
  { emoji: "🚣", name: "Kayaking", count: "19 trips" },
];

export default function ActivityGrid() {
  const router = useRouter();

  return (
    <div className="grid grid-cols-6 gap-2.5 mb-12">
      {ACTIVITIES.map((a) => (
        <button
          key={a.name}
          onClick={() => router.push(`/compare?q=${encodeURIComponent(a.name)}`)}
          className="bg-cream border border-border rounded-[12px] px-2 py-4 cursor-pointer text-center hover:border-green transition-colors"
        >
          <span className="text-[24px] mb-1.5 block">{a.emoji}</span>
          <div className="text-[12px] font-semibold text-text-primary mb-0.5">{a.name}</div>
          <div className="text-[10px] text-text-light">{a.count}</div>
        </button>
      ))}
    </div>
  );
}
