const BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`);
  return data;
}

export async function fetchTrips(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""))
  ).toString();
  return apiFetch(`/trips${qs ? `?${qs}` : ""}`);
}

export async function fetchTrip(id) {
  return apiFetch(`/trips/${id}`);
}

export async function fetchRelatedTrips(id, limit = 4) {
  return apiFetch(`/trips/${id}/related?limit=${limit}`);
}

export async function fetchFilterOptions() {
  return apiFetch("/trips/filters");
}

export async function submitEnquiry(body) {
  return apiFetch("/enquiries", { method: "POST", body: JSON.stringify(body) });
}

export async function fetchStats() {
  return apiFetch("/stats");
}

export async function fetchHealth() {
  return apiFetch("/health");
}
