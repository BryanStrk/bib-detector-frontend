import { useState } from "react";
import RacePhoto from "./RacePhoto";
import { UploadIcon, PlayIcon, ScanIcon, ClockIcon } from "./Icons";
import { confidenceTier, formatPct, TIER_STYLES } from "../lib/confidence";

const BOX_COLOR = {
  high: "#34d399",
  mid: "#fbbf24",
  low: "#f87171",
};

function BoundingBox({ detection, index, visible }) {
  const tier = confidenceTier(detection.confidence);
  const color = BOX_COLOR[tier];
  const { x, y, w, h } = detection.box;

  return (
    <div
      className="absolute transition-all duration-500"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${w}%`,
        height: `${h}%`,
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.92)",
        transitionDelay: `${index * 110}ms`,
      }}
    >
      <div
        className="h-full w-full rounded-md"
        style={{ border: `2px solid ${color}`, boxShadow: `0 0 0 1px rgba(0,0,0,0.4), 0 0 14px ${color}55` }}
      />
      {/* corner ticks */}
      {["-top-px -left-px", "-top-px -right-px", "-bottom-px -left-px", "-bottom-px -right-px"].map(
        (pos) => (
          <span
            key={pos}
            className={`absolute h-2 w-2 ${pos}`}
            style={{ borderColor: color, border: "2px solid", borderRadius: 2 }}
          />
        ),
      )}
      {/* label */}
      <span
        className="absolute -top-6 left-0 flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 font-mono text-[11px] font-semibold text-canvas"
        style={{ backgroundColor: color }}
      >
        #{detection.bib}
        <span className="opacity-80">({formatPct(detection.confidence)})</span>
      </span>
    </div>
  );
}

export default function DetectionViewer({ image }) {
  // UI-only state: simulate an analysis pass over the loaded photo.
  const [analyzed, setAnalyzed] = useState(true);
  const [running, setRunning] = useState(false);

  function runAnalysis() {
    setRunning(true);
    setAnalyzed(false);
    window.setTimeout(() => {
      setRunning(false);
      setAnalyzed(true);
    }, 1400);
  }

  return (
    <section
      aria-labelledby="engine-heading"
      className="flex flex-col rounded-2xl border border-line bg-surface/70 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.35)] sm:p-6"
    >
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface-2 text-accent-cyan">
            <ScanIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 id="engine-heading" className="text-base font-semibold text-ink">
              Detection Engine
            </h2>
            <p className="font-mono text-xs text-ink-faint">{image.model}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-elevated"
          >
            <UploadIcon className="h-[18px] w-[18px] text-ink-muted" />
            Upload Batch
          </button>
          <button
            type="button"
            onClick={runAnalysis}
            disabled={running}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-cyan px-4 py-2.5 text-sm font-semibold text-canvas shadow-[0_4px_18px_rgba(34,211,238,0.3)] transition-[filter,opacity] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <PlayIcon className="h-4 w-4" />
            {running ? "Analyzing…" : "Run Analysis"}
          </button>
        </div>
      </div>

      {/* viewer */}
      <div className="relative mt-5 overflow-hidden rounded-xl border border-line bg-canvas">
        <div className="relative aspect-[4/3] w-full">
          <RacePhoto className="absolute inset-0 h-full w-full" />

          {/* subtle vignette for contrast */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/55 via-transparent to-transparent" />

          {/* scanning sweep while running */}
          {running && (
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div
                className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-accent-cyan/25 to-transparent"
                style={{ animation: "scan-sweep 1.4s ease-in-out" }}
              />
              <style>{`@keyframes scan-sweep{0%{top:-30%}100%{top:110%}}`}</style>
            </div>
          )}

          {/* overlays */}
          {image.detections.map((d, i) => (
            <BoundingBox key={d.id} detection={d} index={i} visible={analyzed} />
          ))}

          {/* detection count chip */}
          <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-line/80 bg-canvas/80 px-2.5 py-1 backdrop-blur">
            <span
              className="h-1.5 w-1.5 rounded-full bg-accent-cyan"
              style={{ animation: "pulse-soft 1.8s ease-in-out infinite" }}
            />
            <span className="font-mono text-xs text-ink-muted">
              {analyzed ? `${image.detections.length} bibs` : "—"}
            </span>
          </div>
        </div>

        {/* status bar */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line bg-surface/80 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2 text-ink-muted">
            <span className="shrink-0 rounded-md bg-surface-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-faint">
              File
            </span>
            <span className="truncate font-mono text-xs text-ink" title={image.filename}>
              {image.filename}
            </span>
            <span className="hidden font-mono text-xs text-ink-faint sm:inline">
              · {image.resolution}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <ClockIcon className="h-4 w-4 text-ink-faint" />
            <span className="text-ink-muted">Processed in</span>
            <span className="font-semibold text-accent-cyan">
              {running ? "…" : image.processingTime}
            </span>
          </div>
        </div>
      </div>

      {/* legend */}
      <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-muted">
        {["high", "mid", "low"].map((tier) => (
          <li key={tier} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-sm ${TIER_STYLES[tier].dot}`} />
            {TIER_STYLES[tier].label}
            <span className="font-mono text-ink-faint">
              {tier === "high" ? ">90%" : tier === "mid" ? "70–90%" : "<70%"}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
