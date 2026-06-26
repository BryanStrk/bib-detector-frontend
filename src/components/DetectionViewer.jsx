import { useRef, useState } from "react";
import RacePhoto from "./RacePhoto";
import { UploadIcon, PlayIcon, ScanIcon, ClockIcon } from "./Icons";
import { confidenceTier, formatPct, TIER_STYLES } from "../lib/confidence";
import { bboxToPercent } from "../lib/detections";

const BOX_COLOR = { high: "#34d399", mid: "#fbbf24", low: "#f87171" };

function BoundingBox({ detection, pct, index, hoveredId }) {
  const tier = confidenceTier(detection.confidence);
  const color = BOX_COLOR[tier];

  const isHighlighted = hoveredId === detection.id;
  const isDimmed = hoveredId != null && !isHighlighted;

  return (
    <div
      className={`absolute transition-all duration-500 ${isHighlighted ? "z-10" : ""}`}
      style={{
        left: `${pct.x}%`,
        top: `${pct.y}%`,
        width: `${pct.w}%`,
        height: `${pct.h}%`,
        transitionDelay: `${index * 90}ms`,
        opacity: isDimmed ? 0.35 : 1,
      }}
    >
      <div
        className="h-full w-full rounded-md"
        style={{
          border: `${isHighlighted ? 3 : 2}px solid ${color}`,
          boxShadow: isHighlighted
            ? `0 0 0 1px rgba(0,0,0,0.4), 0 0 20px ${color}aa`
            : `0 0 0 1px rgba(0,0,0,0.4), 0 0 14px ${color}55`,
        }}
      />
      {["-top-px -left-px", "-top-px -right-px", "-bottom-px -left-px", "-bottom-px -right-px"].map(
        (pos) => (
          <span
            key={pos}
            className={`absolute h-2 w-2 ${pos}`}
            style={{ borderColor: color, border: "2px solid", borderRadius: 2 }}
          />
        ),
      )}
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

export default function DetectionViewer({
  isDemo,
  imageUrl,
  detections,
  status, // 'idle' | 'ready' | 'loading' | 'done' | 'error'
  error,
  filename,
  resolution,
  processingTime,
  model,
  onSelectFile,
  onRunAnalysis,
  readOnly = false, // hide Upload/Run actions (e.g. gallery detail view)
  hoveredId = null, // id of the detection hovered in the entities panel
}) {
  const fileInputRef = useRef(null);
  // Natural size is tagged with the image URL it was measured for, so a stale
  // measurement is never used against a freshly-swapped image.
  const [natural, setNatural] = useState(null); // {url, w, h}
  const measured = natural && natural.url === imageUrl ? natural : null;

  // Demo-only: run the scan sweep while the pointer is over the image.
  const [isScanning, setIsScanning] = useState(false);

  const isLoading = status === "loading";
  const showBoxes = isDemo || status === "done";
  const canAnalyze = status === "ready" || status === "done" || status === "error";

  // Compute layout-independent percentage boxes for each detection.
  const overlays = showBoxes
    ? detections
        .map((d) => {
          // Demo detections carry ready-made percentages; real ones carry
          // pixel bboxes that need the image's natural size to scale.
          const pct = d.box ?? bboxToPercent(d.bbox, measured);
          return pct ? { detection: d, pct } : null;
        })
        .filter(Boolean)
    : [];

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) onSelectFile(file);
    e.target.value = ""; // allow re-selecting the same file
  }

  return (
    <section
      aria-labelledby="engine-heading"
      className="flex flex-col rounded-2xl border border-line bg-surface/70 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.35)] sm:p-6"
    >
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface-2 text-accent">
            <ScanIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 id="engine-heading" className="text-base font-semibold text-ink">
              Detection Engine
            </h2>
            <p className="font-mono text-xs text-ink-faint">{model}</p>
          </div>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-elevated"
            >
              <UploadIcon className="h-[18px] w-[18px] text-ink-muted" />
              Upload Batch
            </button>
            <button
              type="button"
              onClick={onRunAnalysis}
              disabled={!canAnalyze || isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              <PlayIcon className="h-4 w-4" />
              {isLoading ? "Analyzing…" : "Run Analysis"}
            </button>
          </div>
        )}
      </div>

      {/* viewer */}
      <div className="relative mt-5 overflow-hidden rounded-xl border border-line bg-canvas">
        {isDemo ? (
          /* Demo / empty state: the self-contained SVG race scene. */
          <div
            className="relative aspect-[1296/729] w-full"
            onMouseEnter={() => setIsScanning(true)}
            onMouseLeave={() => setIsScanning(false)}
          >
            <RacePhoto className="absolute inset-0 h-full w-full" />
            <ViewerOverlays
              isLoading={isLoading}
              isDemo={isDemo}
              scanning={isScanning}
              overlays={overlays}
              count={detections.length}
              showCount={showBoxes}
              hoveredId={hoveredId}
            />
          </div>
        ) : (
          /* Live state: the real uploaded image, sized to its own aspect
             ratio so percentage overlays map exactly onto it. */
          <div className="flex justify-center">
            <div className="relative inline-block max-w-full">
              <img
                src={imageUrl}
                alt={`Uploaded race photo: ${filename}`}
                onLoad={(e) =>
                  setNatural({
                    url: imageUrl,
                    w: e.currentTarget.naturalWidth,
                    h: e.currentTarget.naturalHeight,
                  })
                }
                className="block max-h-[60vh] w-auto max-w-full"
              />
              <ViewerOverlays
                isLoading={isLoading}
                isDemo={isDemo}
                scanning={false}
                overlays={overlays}
                count={detections.length}
                showCount={showBoxes}
                hoveredId={hoveredId}
              />
            </div>
          </div>
        )}

        {/* error banner */}
        {status === "error" && (
          <div
            role="alert"
            className="flex items-start gap-3 border-t border-conf-low/40 bg-conf-low/10 px-4 py-3"
          >
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-conf-low/20 font-mono text-xs font-bold text-conf-low">
              !
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-conf-low">Analysis failed</p>
              <p className="mt-0.5 text-xs text-ink-muted">{error}</p>
            </div>
          </div>
        )}

        {/* status bar */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line bg-surface/80 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2 text-ink-muted">
            <span className="shrink-0 rounded-md bg-surface-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-ink-faint">
              File
            </span>
            <span className="truncate font-mono text-xs text-ink" title={filename}>
              {filename}
            </span>
            {resolution && (
              <span className="hidden font-mono text-xs text-ink-faint sm:inline">
                · {resolution}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <ClockIcon className="h-4 w-4 text-ink-faint" />
            <span className="text-ink-muted">Processed in</span>
            <span className="font-semibold text-accent">
              {isLoading ? "…" : status === "done" || isDemo ? processingTime : "—"}
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

/** Shared overlay layer (boxes, scanning sweep, count chip, vignette). */
function ViewerOverlays({ isLoading, scanning, overlays, count, showCount, hoveredId }) {
  // The scanner runs while a real analysis is processing, and — in demo — only
  // while the pointer hovers the image. Loading is faster + brighter to signal
  // active work; the demo hover sweep is medium-paced and elegant.
  const showSweep = isLoading || scanning;

  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/55 via-transparent to-transparent" />

      {showSweep && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* A crisp scan line with a soft trail, both sweeping together. */}
          <div
            className="scan-sweep-track absolute inset-x-0"
            style={{
              animation: `scan-sweep ${isLoading ? "1.6s" : "2s"} ease-in-out infinite`,
              opacity: isLoading ? 1 : 0.6,
            }}
          >
            {/* trail — fades in toward the leading line below it */}
            <div className="h-20 bg-gradient-to-b from-accent/0 to-accent/25" />
            {/* leading line — thin, bright, with a subtle glow */}
            <div
              className="h-px w-full bg-accent"
              style={{ boxShadow: "0 0 8px var(--color-accent)" }}
            />
          </div>
          <style>{`
            @keyframes scan-sweep { 0% { top: -30%; } 100% { top: 110%; } }
            @media (prefers-reduced-motion: reduce) {
              .scan-sweep-track { display: none; }
            }
          `}</style>
        </div>
      )}

      {overlays.map(({ detection, pct }, i) => (
        <BoundingBox
          key={detection.id}
          detection={detection}
          pct={pct}
          index={i}
          hoveredId={hoveredId}
        />
      ))}

      <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-line/80 bg-canvas/80 px-2.5 py-1 backdrop-blur">
        <span
          className="h-1.5 w-1.5 rounded-full bg-accent"
          style={{ animation: "pulse-soft 1.8s ease-in-out infinite" }}
        />
        <span className="font-mono text-xs text-ink-muted">
          {isLoading || scanning ? "scanning…" : showCount ? `${count} bibs` : "—"}
        </span>
      </div>
    </>
  );
}
