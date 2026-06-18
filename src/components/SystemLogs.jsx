import { useId, useMemo, useState } from "react";
import { SearchIcon } from "./Icons";
import { confidenceTier, formatPct, TIER_STYLES } from "../lib/confidence";

const COLUMNS = [
  { key: "timestamp", label: "Timestamp" },
  { key: "source", label: "File Source" },
  { key: "detectedCount", label: "Detected Bibs" },
  { key: "confidence", label: "Confidence" },
  { key: "processingTime", label: "Processing Time" },
  { key: "status", label: "Status" },
];

const STATUS_STYLES = {
  Processed: "border-conf-high/40 bg-conf-high/10 text-conf-high",
  Processing: "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan",
  Failed: "border-conf-low/40 bg-conf-low/10 text-conf-low",
};

function StatusBadge({ status }) {
  const cls = STATUS_STYLES[status] ?? "border-line bg-surface-2 text-ink-muted";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-current"
        style={
          status === "Processing"
            ? { animation: "pulse-soft 1.4s ease-in-out infinite" }
            : undefined
        }
      />
      {status}
    </span>
  );
}

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

export default function SystemLogs({ logs }) {
  const [query, setQuery] = useState("");
  const searchId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((row) =>
      [row.timestamp, row.source, row.status].some((v) =>
        String(v).toLowerCase().includes(q),
      ),
    );
  }, [logs, query]);

  return (
    <section
      id="history"
      aria-labelledby="logs-heading"
      className="rounded-2xl border border-line bg-surface/70 shadow-[0_8px_40px_rgba(0,0,0,0.35)]"
    >
      {/* header + search */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line p-5 sm:p-6">
        <div>
          <h2 id="logs-heading" className="text-base font-semibold text-ink">
            System Logs
          </h2>
          <p className="mt-1 text-xs text-ink-faint">
            Detection jobs across all sources
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <label htmlFor={searchId} className="sr-only">
            Search logs by timestamp, file, or status
          </label>
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink-faint" />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search logs…"
            className="w-full rounded-xl border border-line bg-surface-2 py-2.5 pl-10 pr-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-accent-cyan/60 focus:outline-none"
          />
        </div>
      </div>

      {/* table (scrolls horizontally on small screens) */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <caption className="sr-only">
            Detection job log with timestamp, source file, number of bibs
            detected, average confidence, processing time, and status.
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
            {filtered.map((row) => (
              <tr
                key={row.id}
                className="border-b border-line/60 transition-colors last:border-0 hover:bg-surface-2/50"
              >
                <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-ink-muted sm:px-6">
                  {row.timestamp}
                </td>
                <td className="px-5 py-3.5 font-mono text-xs text-ink sm:px-6">
                  {row.source}
                </td>
                <td className="px-5 py-3.5 sm:px-6">
                  <span className="font-mono text-sm font-semibold text-ink">
                    {row.detectedCount}
                  </span>
                  <span className="ml-1 text-xs text-ink-faint">
                    {row.detectedCount === 1 ? "bib" : "bibs"}
                  </span>
                </td>
                <td className="px-5 py-3.5 sm:px-6">
                  <ConfidenceCell value={row.avgConfidence} />
                </td>
                <td className="whitespace-nowrap px-5 py-3.5 font-mono text-xs text-ink-muted sm:px-6">
                  {row.processingTime}
                </td>
                <td className="px-5 py-3.5 sm:px-6">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-6 py-10 text-center text-sm text-ink-faint"
                >
                  No log entries match{" "}
                  <span className="font-mono text-ink-muted">“{query}”</span>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* footer summary */}
      <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3 sm:px-6">
        <p className="font-mono text-xs text-ink-faint">
          {filtered.length} of {logs.length} entries
        </p>
        <span className="flex items-center gap-1.5 text-xs text-ink-faint">
          <span
            className="h-1.5 w-1.5 rounded-full bg-conf-high"
            style={{ animation: "pulse-soft 1.8s ease-in-out infinite" }}
          />
          Live
        </span>
      </div>
    </section>
  );
}
