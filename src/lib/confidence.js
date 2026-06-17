// Shared confidence helpers so color thresholds stay consistent
// across the ConfidenceBar, ExtractedEntities, and SystemLogs.

/** Tier for a 0–1 confidence value: high >90%, mid 70–90%, low <70%. */
export function confidenceTier(value) {
  if (value >= 0.9) return "high";
  if (value >= 0.7) return "mid";
  return "low";
}

/** Tailwind-friendly token bundle per tier. */
export const TIER_STYLES = {
  high: {
    bar: "bg-conf-high",
    text: "text-conf-high",
    dot: "bg-conf-high",
    glow: "shadow-[0_0_12px_rgba(52,211,153,0.45)]",
    label: "High",
  },
  mid: {
    bar: "bg-conf-mid",
    text: "text-conf-mid",
    dot: "bg-conf-mid",
    glow: "shadow-[0_0_12px_rgba(251,191,36,0.4)]",
    label: "Medium",
  },
  low: {
    bar: "bg-conf-low",
    text: "text-conf-low",
    dot: "bg-conf-low",
    glow: "shadow-[0_0_12px_rgba(248,113,113,0.4)]",
    label: "Low",
  },
};

/** Format a 0–1 value as a percentage string, e.g. 0.984 → "98%". */
export function formatPct(value, digits = 0) {
  return `${(value * 100).toFixed(digits)}%`;
}
