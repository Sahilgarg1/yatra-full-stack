"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TripCard from "./TripCard";
import CompareDrawer from "./CompareDrawer";

const HOST_FILTERS = [
  { value: "", label: "All hosts" },
  { value: "agency", label: "Agencies" },
  { value: "influencer", label: "Influencers" },
  { value: "local", label: "Local guides" },
];

const SORT_OPTIONS = [
  { value: "value_score", label: "Best value" },
  { value: "price_asc", label: "Price: low → high" },
  { value: "price_desc", label: "Price: high → low" },
  { value: "duration_asc", label: "Shortest first" },
];

function Skeleton() {
  return (
    <div className="grid grid-cols-3 gap-3.5 p-4">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-cream border border-border rounded-[13px] overflow-hidden animate-pulse">
          <div className="h-[110px] bg-border" />
          <div className="p-3.5 space-y-2">
            <div className="h-3 bg-border rounded w-3/4" />
            <div className="h-2.5 bg-border rounded w-1/2" />
            <div className="h-5 bg-border rounded w-2/5" />
            <div className="h-2.5 bg-border rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CompareClient({ initialQ, initialDate, initialDays }) {
  const router = useRouter();

  const [search, setSearch] = useState(initialQ || "");
  const [hostFilter, setHostFilter] = useState("");
  const [sort, setSort] = useState("value_score");
  const [trips, setTrips] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedTrips, setSelectedTrips] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailTrip, setDetailTrip] = useState(null);
  const [sortOpen, setSortOpen] = useState(false);

  const timer = useRef(null);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, page, limit: 18 });
      if (search) params.set("q", search);
      if (hostFilter) params.set("host_type", hostFilter);
      const res = await fetch(`/api/trips?${params}`);
      const data = await res.json();
      setTrips(data.trips || []);
      setPagination(data.pagination);
    } catch {
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [search, hostFilter, sort, page]);

  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(loadTrips, search ? 400 : 0);
    return () => clearTimeout(timer.current);
  }, [loadTrips, search]);

  function toggleCompare(trip) {
    setSelectedTrips((prev) => {
      const exists = prev.find((t) => t.id === trip.id);
      if (exists) return prev.filter((t) => t.id !== trip.id);
      if (prev.length >= 4) return prev;
      const next = [...prev, trip];
      if (next.length >= 2) setDrawerOpen(true);
      return next;
    });
  }

  function formatDate(raw) {
    if (!raw) return null;
    // "2025-07" → "July 2025"; plain text like "Aug 2025" passed through as-is
    const isoMonth = raw.match(/^(\d{4})-(\d{2})$/);
    if (isoMonth) {
      const d = new Date(Number(isoMonth[1]), Number(isoMonth[2]) - 1, 1);
      return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    }
    return raw;
  }

  const contextSummary = [
    initialQ && `Group trips to ${initialQ}`,
    initialDate && `from ${formatDate(initialDate)}`,
    initialDays && `~${initialDays} days`,
  ]
    .filter(Boolean)
    .join(" · ");

  const currentSort = SORT_OPTIONS.find((o) => o.value === sort)?.label || "Sort";

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Search context bar */}
      {contextSummary && (
        <div className="bg-dark-green px-5 py-3.5 flex items-center gap-3 border-b border-mid-green flex-shrink-0">
          <Link
            href="/"
            className="text-text-light border border-mid-green rounded-[6px] px-[11px] py-[5px] text-[12px] no-underline hover:text-cream"
          >
            ← Back
          </Link>
          <div className="text-cream text-[14px] font-medium">
            <span>{contextSummary}</span>
          </div>
          <Link
            href="/"
            className="ml-auto text-text-light border border-mid-green rounded-[6px] px-[10px] py-1 text-[11px] no-underline hover:text-cream"
          >
            Edit search
          </Link>
        </div>
      )}

      {/* Search + filter bar */}
      <div className="bg-cream border-b border-border px-5 py-2.5 flex items-center gap-2 flex-wrap flex-shrink-0">
        {/* Search input */}
        <div className="flex items-center bg-white border border-border rounded-[8px] px-3 gap-2 flex-1 min-w-[200px]">
          <span className="text-text-light text-[15px]">⌕</span>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search destination or trip…"
            className="flex-1 py-[8px] text-[13px] outline-none text-text-primary placeholder:text-text-light bg-transparent"
          />
        </div>

        {/* Host filter chips */}
        <div className="flex gap-1.5 flex-wrap">
          {HOST_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => { setHostFilter(value); setPage(1); }}
              className={`px-[11px] py-[5px] rounded-[6px] text-[12px] font-medium border cursor-pointer ${
                hostFilter === value
                  ? "bg-dark-green border-dark-green text-cream"
                  : "bg-white border-border text-text-secondary hover:border-green"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="w-px h-[18px] bg-border" />

        {/* Sort picker */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="px-[11px] py-[5px] rounded-[6px] text-[12px] font-medium border border-border bg-white text-text-secondary cursor-pointer"
          >
            {currentSort} ▾
          </button>
          {sortOpen && (
            <div className="absolute right-0 top-9 bg-white border border-border rounded-[8px] shadow-md z-50 py-1 min-w-[160px]">
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => { setSort(o.value); setSortOpen(false); setPage(1); }}
                  className={`w-full text-left px-4 py-2.5 text-[13px] cursor-pointer border-none bg-transparent ${
                    sort === o.value ? "font-bold text-dark-green bg-beige" : "text-text-secondary hover:bg-beige/50"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Result count */}
        <span className="text-[12px] text-text-light ml-auto">
          {pagination?.total ?? "…"} trips found
        </span>
      </div>

      {/* Cards area */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <Skeleton />
        ) : trips.length === 0 ? (
          <div className="flex flex-col items-center py-20">
            <div className="text-[32px] text-text-light mb-3">◎</div>
            <div className="text-[20px] font-bold text-text-secondary mb-1">No trips found</div>
            <div className="text-[14px] text-text-light">Try adjusting your filters</div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3.5 p-4 pb-2">
              {trips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  selected={!!selectedTrips.find((t) => t.id === trip.id)}
                  onToggleCompare={toggleCompare}
                  onOpen={setDetailTrip}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="flex justify-center items-center gap-3 py-5">
                <button
                  disabled={!pagination.has_prev}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 border border-border rounded-[8px] text-[13px] text-text-secondary bg-white cursor-pointer disabled:opacity-40"
                >
                  ← Prev
                </button>
                <span className="text-[13px] text-text-muted">
                  Page {pagination.page} of {pagination.total_pages}
                </span>
                <button
                  disabled={!pagination.has_next}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 border border-border rounded-[8px] text-[13px] text-text-secondary bg-white cursor-pointer disabled:opacity-40"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Compare bar */}
      {selectedTrips.length > 0 && (
        <div className="bg-dark-green border-t border-mid-green px-5 py-3 flex items-center gap-2.5 flex-shrink-0">
          <div className="flex gap-2 flex-1">
            {selectedTrips.map((t) => (
              <div
                key={t.id}
                className="bg-mid-green border border-dashed border-green rounded-[8px] px-3 py-[7px] min-w-[120px] flex items-center justify-between gap-1.5"
              >
                <span className="text-cream text-[12px] font-medium truncate max-w-[90px]">
                  {t.title}
                </span>
                <button
                  onClick={() => setSelectedTrips((p) => p.filter((x) => x.id !== t.id))}
                  className="text-text-muted text-[14px] bg-transparent border-none cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
            {selectedTrips.length < 4 && (
              <div className="bg-mid-green border border-dashed border-mid-green rounded-[8px] px-3 py-[7px] min-w-[120px]">
                <span className="text-green text-[12px]">+ add trip</span>
              </div>
            )}
          </div>
          {selectedTrips.length >= 2 && (
            <button
              onClick={() => setDrawerOpen(true)}
              className="bg-gold text-dark-green border-none rounded-[8px] px-[18px] py-[9px] text-[13px] font-bold cursor-pointer whitespace-nowrap"
            >
              Compare side by side →
            </button>
          )}
          {selectedTrips.length === 1 && (
            <span className="text-text-muted text-[11px] whitespace-nowrap">Select 1 more to compare</span>
          )}
        </div>
      )}

      {/* Side-by-side drawer */}
      {drawerOpen && selectedTrips.length >= 2 && (
        <CompareDrawer
          trips={selectedTrips}
          onClose={() => setDrawerOpen(false)}
          onRemove={(t) => setSelectedTrips((p) => p.filter((x) => x.id !== t.id))}
        />
      )}
    </div>
  );
}
