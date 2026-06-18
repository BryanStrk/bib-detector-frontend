import { cloudinaryThumb, formatDate, uniqueBibs } from "../lib/detections";
import { confidenceTier, TIER_STYLES } from "../lib/confidence";

const MAX_CHIPS = 5;

function BibChip({ bib, confidence }) {
  const styles = TIER_STYLES[confidenceTier(confidence)];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface-2 px-2 py-0.5 font-mono text-xs text-ink">
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />#{bib}
    </span>
  );
}

export default function PhotoCard({ photo, onOpen }) {
  const bibs = uniqueBibs(photo.detections);
  const shown = bibs.slice(0, MAX_CHIPS);
  const overflow = bibs.length - shown.length;
  const thumb = cloudinaryThumb(photo.cloudinaryUrl);

  return (
    <button
      type="button"
      onClick={() => onOpen(photo)}
      aria-label={`Open ${photo.filename} — ${photo.detections.length} detections`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface/70 text-left shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
    >
      {/* image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-canvas">
        {thumb ? (
          <img
            src={thumb}
            alt={`Race photo ${photo.filename}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="grid h-full w-full place-items-center font-mono text-xs text-ink-faint">
            no image
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-canvas/70 via-transparent to-transparent" />

        {/* detection count badge */}
        <span className="absolute right-2.5 top-2.5 flex items-center gap-1.5 rounded-full border border-line/80 bg-canvas/80 px-2.5 py-1 font-mono text-xs text-ink backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" />
          {photo.detections.length}
        </span>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col gap-3 p-3.5">
        <div className="flex flex-wrap gap-1.5">
          {shown.length > 0 ? (
            <>
              {shown.map((b) => (
                <BibChip key={b.bib} bib={b.bib} confidence={b.confidence} />
              ))}
              {overflow > 0 && (
                <span className="inline-flex items-center rounded-md border border-line bg-surface-2 px-2 py-0.5 font-mono text-xs text-ink-faint">
                  +{overflow}
                </span>
              )}
            </>
          ) : (
            <span className="font-mono text-xs text-ink-faint">no bibs</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line/60 pt-2.5">
          <span className="truncate font-mono text-[11px] text-ink-faint" title={photo.filename}>
            {photo.filename}
          </span>
          <span className="shrink-0 font-mono text-[11px] text-ink-muted">
            {formatDate(photo.createdAt)}
          </span>
        </div>
      </div>
    </button>
  );
}
