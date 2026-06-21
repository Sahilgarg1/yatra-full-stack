const API = process.env.API_URL || "http://localhost:3001";

export async function getStats() {
  try {
    const res = await fetch(`${API}/stats`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getTrending() {
  try {
    const res = await fetch(`${API}/trips?sort=value_score&limit=4`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.trips || [];
  } catch {
    return [];
  }
}

export function formatINR(n) {
  if (!n) return "Price on request";
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}
