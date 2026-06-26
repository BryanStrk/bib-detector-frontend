import ConfidenceBar from "./ConfidenceBar";
import { ExportIcon } from "./Icons";
import { confidenceTier, formatPct, TIER_STYLES } from "../lib/confidence";

function EntityRow({ detection, index, onHover }) {
  const tier = confidenceTier(detection.confidence);
  const styles = TIER_STYLES[tier];

  return (
    <li
      onMouseEnter={() => onHover?.(detection.id)}
      onMouseLeave={() => onHover?.(null)}
      className="group cursor-default rounded-xl border border-line bg-surface-2/60 p-3.5 transition-colors hover:border-line-strong hover:bg-surface-2"
    >
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

export default function ExtractedEntities({ detections, onHover }) {
  const isEmpty = detections.length === 0;

  const handleExport = () => {
    const payload = detections.map(({ bib, confidence, bbox, box }) => ({
      bib,
      confidence,
      bbox: bbox ?? box ?? null,
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "detections.json";
    a.click();
    URL.revokeObjectURL(url);
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

      {isEmpty ? (
        <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line py-12 text-center">
          <span className="font-mono text-2xl text-ink-faint">{"{ }"}</span>
          <p className="text-sm text-ink-muted">No entities yet</p>
          <p className="max-w-[14rem] text-xs text-ink-faint">
            Upload a race photo and run analysis to extract bib numbers.
          </p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-1 flex-col gap-2.5">
          {detections.map((d, i) => (
            <EntityRow key={d.id} detection={d} index={i} onHover={onHover} />
          ))}
        </ul>
      )}

      <button
        type="button"
        onClick={handleExport}
        disabled={isEmpty}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-accent/50 hover:bg-elevated disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line"
      >
        <ExportIcon className="h-[18px] w-[18px] text-accent" />
        Export JSON
      </button>
    </section>
  );
}
