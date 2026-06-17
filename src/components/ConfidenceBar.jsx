import { confidenceTier, formatPct, TIER_STYLES } from "../lib/confidence";

/**
 * Thin animated confidence bar, color-coded by tier.
 * @param {number} value 0–1 confidence score.
 * @param {number} delay ms before the grow animation starts (for staggering).
 */
export default function ConfidenceBar({ value, delay = 0 }) {
  const tier = confidenceTier(value);
  const styles = TIER_STYLES[tier];
  const pct = formatPct(value);

  return (
    <div
      className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
      role="progressbar"
      aria-valuenow={Math.round(value * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Confidence ${pct}, ${styles.label.toLowerCase()}`}
    >
      <div
        className={`h-full origin-left rounded-full ${styles.bar} ${styles.glow}`}
        style={{
          width: pct,
          animation: `bar-grow 0.9s cubic-bezier(0.22,1,0.36,1) ${delay}ms both`,
        }}
      />
    </div>
  );
}
