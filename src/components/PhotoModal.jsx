import { useEffect, useRef, useState } from "react";
import DetectionViewer from "./DetectionViewer";
import ExtractedEntities from "./ExtractedEntities";
import { CloseIcon } from "./Icons";
import { getPhoto } from "../services/detectionApi";
import { normalizePhoto, formatSeconds, formatDate } from "../lib/detections";
import { ENGINE_LABEL } from "../config";

export default function PhotoModal({ photo, onClose }) {
  // Render the list data immediately, then enrich from /photos/{id}.
  const [detail, setDetail] = useState(photo);
  const closeRef = useRef(null);

  // Refresh from the single-photo endpoint (authoritative detections).
  // The list data renders immediately via the initial state; this enriches it.
  // (Gallery keys this modal by photo id, so it remounts per photo.)
  useEffect(() => {
    let cancelled = false;
    if (!photo?.id) return undefined;
    getPhoto(photo.id)
      .then((data) => {
        const full = normalizePhoto(data);
        if (!cancelled && full) setDetail(full);
      })
      .catch(() => {
        /* keep the list data on failure */
      });
    return () => {
      cancelled = true;
    };
  }, [photo]);

  // Escape to close, lock body scroll, manage focus.
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [onClose]);

  if (!detail) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-canvas/80 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detection detail for ${detail.filename}`}
        onClick={(e) => e.stopPropagation()}
        className="my-4 w-full max-w-6xl rounded-2xl border border-line bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
      >
        {/* header */}
        <div className="flex items-center justify-between gap-3 border-b border-line p-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate font-mono text-sm font-semibold text-ink">
              {detail.filename}
            </h2>
            <p className="mt-0.5 font-mono text-xs text-ink-faint">
              {detail.detections.length} detections · {formatDate(detail.createdAt)}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close detail"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* body — same two-column layout as the dashboard */}
        <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.65fr_1fr]">
          <DetectionViewer
            readOnly
            isDemo={false}
            imageUrl={detail.cloudinaryUrl}
            detections={detail.detections}
            status="done"
            error={null}
            filename={detail.filename}
            resolution={null}
            processingTime={formatSeconds(detail.processingSeconds)}
            model={ENGINE_LABEL}
          />
          <ExtractedEntities detections={detail.detections} />
        </div>
      </div>
    </div>
  );
}
