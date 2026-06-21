export const Colors = {
  darkGreen: "#1A2B1F",
  green: "#4A7C59",
  midGreen: "#2D4A35",
  gold: "#F5A623",
  cream: "#FAFAF7",
  beige: "#F0EDE8",
  beigeLight: "#F0E6D3",
  border: "#E8E0D4",
  borderDark: "#E0D4C0",
  textPrimary: "#1A2B1F",
  textSecondary: "#374151",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",
  red: "#B94040",
  redLight: "#E24B4A",
  redBg: "#FCEBEB",
  orange: "#C4762A",
  purple: "#7B5EA7",
  whatsapp: "#25D366",
};

export const HostColors = {
  agency: Colors.green,
  influencer: Colors.purple,
  local: Colors.orange,
};

export const HostLabels = {
  agency: "Agency",
  influencer: "Influencer",
  local: "Local Guide",
};

export const DiffColors = {
  easy: Colors.green,
  moderate: Colors.orange,
  challenging: Colors.red,
};

export const ALL_INCLUSIONS = ["stay", "meals", "transport", "guide", "permit", "equipment"];

export const SORT_OPTIONS = [
  { value: "value_score", label: "Best value" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "duration_asc", label: "Shortest first" },
];

export const TRAVELER_TYPES = ["Solo", "Couple", "Friends", "Family"];

export const EXPERIENCE_TYPES = ["Trek", "Road Trip", "Cultural", "Adventure", "Wildlife", "Beach"];

export const COPILOT_FEATURES = [
  "Personalised itinerary planning",
  "WhatsApp support throughout your trip",
  "Local restaurant & hidden gem recommendations",
  "Real-time weather & safety alerts",
  "Emergency assistance coordination",
  "Packing list & travel checklist",
];

export function formatINR(n) {
  if (!n) return "Price on request";
  return `\u20B9${Math.round(n).toLocaleString("en-IN")}`;
}
