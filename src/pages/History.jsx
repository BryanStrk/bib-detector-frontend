import { useEffect, useState } from "react";
import { getPhotos } from "../services/detectionApi";
import {
  normalizePhoto,
  formatDate,
  formatSeconds,
  averageConfidence,
  uniqueBibs,
} from "../lib/detections";
import { confidenceTier, formatPct, TIER_STYLES } from "../lib/confidence";

const COLUMNS = [
  { key: "timestamp", label: "Timestamp" },
  { key: "filename", label: "File" },
  { key: "bibs", label: "Detected Bibs" },
  { key: "confidence", label: "Avg Confidence" },
  { key: "processingTime", label: "Processing Time" },
];

/** Pull the photo array out of whatever envelope the API returns. */
function extractList(data) {
  const list = Array.isArray(data)
    ? data
    : (data?.photos ?? data?.results ?? data?.items ?? data?.data ?? []);
  return list.map(normalizePhoto).filter(Boolean);
}

/** Confidence dot + percentage, mirroring SystemLogs' ConfidenceCell. */
function ConfidenceCell({ value }) {
  if (value == null) return <span className="font-mono text-sm text-ink-faint">—</span>;
  const styles = TIER_STYLES[confidenceTier(value)];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />
      <span className={`font-mono text-sm ${styles.text}`}>{formatPct(value)}</span>
    </span>
  );
}

export default function History() {
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getPhotos()
      .then((data) => {
        if (cancelled) return;
        setPhotos(extractList(data));
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const isEmpty = status === "ready" && photos.length === 0;

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* heading */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            History
          </h1>
          <p className="mt-2 max-w-2xl text-base text-ink-muted">
            Every race photo processed by the engine.
          </p>
        </div>
      </div>

      {/* content */}
      <div className="mt-8 sm:mt-10">
        {status === "loading" && <TableSkeleton />}

        {status === "error" && (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        )}

        {isEmpty && (
          <EmptyState
            title="No photos yet"
            hint="Processed photos will appear here."
          />
        )}

        {status === "ready" && photos.length > 0 && (
          <section className="rounded-2xl border border-line bg-surface/70 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <caption className="sr-only">
                  Processed race photos with timestamp, source file, number of
                  bibs detected, average confidence, and processing time.
                </caption>
                <thead>
                  <tr className="border-b border-line">
                    {COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        scope="col"
                        className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-ink-faint sm:px-6"
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {photos.map((photo) => {
                    const bibCount = uniqueBibs(photo.detections).length;
                    return (
                      <tr
                        key={photo.id}
                        className="border-b border-line/60 transition-colors last:border-0 hover:bg-surface-2/50"
                      >
                        <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-ink-muted sm:px-6">
                          {formatDate(photo.createdAt)}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-ink sm:px-6">
                          {photo.filename}
                        </td>
                        <td className="px-5 py-3.5 sm:px-6">
                          <span className="font-mono text-sm font-semibold text-ink">
                            {bibCount}
                          </span>
                          <span className="ml-1 text-xs text-ink-faint">
                            {bibCount === 1 ? "bib" : "bibs"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 sm:px-6">
                          <ConfidenceCell value={averageConfidence(photo.detections)} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-ink-muted sm:px-6">
                          {formatSeconds(photo.processingSeconds)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* footer summary */}
            <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3 sm:px-6">
              <p className="font-mono text-xs text-ink-faint">
                {photos.length} {photos.length === 1 ? "entry" : "entries"}
              </p>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface/70">
      <div className="space-y-3 p-5 sm:p-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-9 w-full rounded bg-surface-2"
            style={{ animation: "pulse-soft 1.6s ease-in-out infinite" }}
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line py-20 text-center">
      <span className="font-mono text-3xl text-ink-faint">[ ]</span>
      <p className="text-base font-medium text-ink">{title}</p>
      <p className="max-w-sm text-sm text-ink-faint">{hint}</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-conf-low/40 bg-conf-low/10 py-16 text-center">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-conf-low/20 font-mono text-lg font-bold text-conf-low">
        !
      </span>
      <p className="text-base font-medium text-conf-low">Couldn’t load photos</p>
      <p className="max-w-md text-sm text-ink-muted">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-1 rounded-xl border border-line bg-surface-2 px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-line-strong"
      >
        Retry
      </button>
    </div>
  );
}
