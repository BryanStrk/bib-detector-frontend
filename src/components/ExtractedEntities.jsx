import ConfidenceBar from "./ConfidenceBar";
import { ExportIcon } from "./Icons";
import { confidenceTier, formatPct, TIER_STYLES } from "../lib/confidence";

function EntityRow({ detection, index }) {
  const tier = confidenceTier(detection.confidence);
  const styles = TIER_STYLES[tier];

  return (
    <li className="group rounded-xl border border-line bg-surface-2/60 p-3.5 transition-colors hover:border-line-strong hover:bg-surface-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-ink-faint">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="font-mono text-lg font-semibold tracking-tight text-ink">
            #{detection.bib}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
          <span className={`font-mono text-sm font-semibold ${styles.text}`}>
            {formatPct(detection.confidence)}
          </span>
        </div>
      </div>
      <div className="mt-3">
        <ConfidenceBar value={detection.confidence} delay={index * 90} />
      </div>
    </li>
  );
}

export default function ExtractedEntities({ detections }) {
  const handleExport = () => {
    // Mock export — log the payload that would be downloaded.
    const payload = detections.map(({ bib, confidence, box }) => ({
      bib,
      confidence,
      box,
    }));
    console.log("Export JSON:", JSON.stringify(payload, null, 2));
  };

  return (
    <section
      aria-labelledby="entities-heading"
      className="flex h-full flex-col rounded-2xl border border-line bg-surface/70 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.35)] sm:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="entities-heading" className="text-base font-semibold text-ink">
          Extracted Entities
        </h2>
        <span className="rounded-full border border-line bg-surface-2 px-2.5 py-0.5 font-mono text-xs text-ink-muted">
          {detections.length}
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-faint">
        Bib numbers recognized in the current frame
      </p>

      <ul className="mt-4 flex flex-1 flex-col gap-2.5">
        {detections.map((d, i) => (
          <EntityRow key={d.id} detection={d} index={i} />
        ))}
      </ul>

      <button
        type="button"
        onClick={handleExport}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-accent-cyan/50 hover:bg-elevated"
      >
        <ExportIcon className="h-[18px] w-[18px] text-accent-cyan" />
        Export JSON
      </button>
    </section>
  );
}
