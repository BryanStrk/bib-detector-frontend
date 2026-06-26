import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import StatsStrip from "../components/StatsStrip";
import { getPhotos } from "../services/detectionApi";
import {
  normalizePhoto,
  uniqueBibs,
  averageConfidence,
  formatSeconds,
  formatDate,
} from "../lib/detections";
import { confidenceTier, formatPct } from "../lib/confidence";
import { useSettings } from "../context/settings-context";

// Design tokens, mirrored from index.css so Recharts never falls back to its
// own (light) defaults. Color is reserved for data, like the rest of the app.
const TOKENS = {
  accent: "#4f9cf9",
  high: "#3ddc97",
  mid: "#f0b429",
  low: "#ef6461",
  inkMuted: "#8b93a1",
  ink: "#e6e9ef",
  line: "#222731",
  surface: "#11141a",
};

// Shared axis + tooltip styling for all three charts.
const AXIS_PROPS = {
  tick: { fill: TOKENS.inkMuted, fontSize: 11 },
  axisLine: { stroke: TOKENS.line },
  tickLine: { stroke: TOKENS.line },
};
const TOOLTIP_PROPS = {
  contentStyle: {
    backgroundColor: TOKENS.surface,
    border: `1px solid ${TOKENS.line}`,
    borderRadius: 8,
    color: TOKENS.ink,
  },
  labelStyle: { color: TOKENS.inkMuted },
  itemStyle: { color: TOKENS.ink },
};

// Respect reduced-motion: turn off Recharts' entrance animations.
const prefersReducedMotion =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const ANIMATE = !prefersReducedMotion;

/** Pull the photo array out of whatever envelope the API returns. */
function extractList(data) {
  const list = Array.isArray(data)
    ? data
    : (data?.photos ?? data?.results ?? data?.items ?? data?.data ?? []);
  return list.map(normalizePhoto).filter(Boolean);
}

/** Short, axis-friendly label for a photo (truncated filename). */
function shortLabel(filename, max = 12) {
  if (!filename) return "—";
  return filename.length > max ? `${filename.slice(0, max)}…` : filename;
}

export default function Analytics() {
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [error, setError] = useState(null);
  // Global minimum-confidence threshold (from the Settings popover).
  const { minConfidence } = useSettings();

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

  // Aggregate metrics — derived from the normalized photos, no invented data.
  const metrics = useMemo(() => {
    // Detection-based metrics honor the minimum-confidence threshold; latency
    // metrics below stay on raw `photos` (independent of the threshold).
    const photosFiltered = photos.map((p) => ({
      ...p,
      detections: p.detections.filter((d) => d.confidence >= minConfidence),
    }));

    const totalPhotos = photos.length;
    const totalBibs = photosFiltered.reduce(
      (sum, p) => sum + uniqueBibs(p.detections).length,
      0,
    );

    const photoAvgs = photosFiltered
      .map((p) => averageConfidence(p.detections))
      .filter((v) => v != null);
    const avgConfidence = photoAvgs.length
      ? photoAvgs.reduce((a, b) => a + b, 0) / photoAvgs.length
      : null;

    const latencies = photos
      .map((p) => p.processingSeconds)
      .filter((v) => v != null);
    const avgLatency = latencies.length
      ? latencies.reduce((a, b) => a + b, 0) / latencies.length
      : null;

    const tierCounts = { high: 0, mid: 0, low: 0 };
    for (const p of photosFiltered) {
      for (const d of p.detections) tierCounts[confidenceTier(d.confidence)] += 1;
    }

    const pieData = [
      { name: "High", value: tierCounts.high, color: TOKENS.high },
      { name: "Medium", value: tierCounts.mid, color: TOKENS.mid },
      { name: "Low", value: tierCounts.low, color: TOKENS.low },
    ];
    const totalDetections = tierCounts.high + tierCounts.mid + tierCounts.low;

    const bibsPerPhoto = photosFiltered.map((p, i) => ({
      name: shortLabel(p.filename),
      index: i + 1,
      bibs: uniqueBibs(p.detections).length,
    }));

    const latencySeries = photos.map((p, i) => ({
      name: p.createdAt ? formatDate(p.createdAt).slice(0, 10) : `#${i + 1}`,
      seconds: p.processingSeconds ?? 0,
    }));

    return {
      totalPhotos,
      totalBibs,
      avgConfidence,
      avgLatency,
      pieData,
      totalDetections,
      bibsPerPhoto,
      latencySeries,
    };
  }, [photos, minConfidence]);

  const statCards = [
    { id: "photos", label: "Total Photos", value: String(metrics.totalPhotos) },
    { id: "bibs", label: "Total Bibs", value: metrics.totalBibs.toLocaleString() },
    {
      id: "conf",
      label: "Avg Confidence",
      value: metrics.avgConfidence == null ? "—" : formatPct(metrics.avgConfidence),
    },
    {
      id: "latency",
      label: "Avg Latency",
      value: formatSeconds(metrics.avgLatency),
    },
  ];

  const isEmpty = status === "ready" && photos.length === 0;

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* heading */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Analytics
          </h1>
          <p className="mt-2 max-w-2xl text-base text-ink-muted">
            Detection performance across all processed photos.
          </p>
          {minConfidence > 0 && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-0.5 font-mono text-xs text-ink-muted">
              Filtered to detections ≥ {formatPct(minConfidence)}
            </p>
          )}
        </div>
      </div>

      {/* content */}
      <div className="mt-8 sm:mt-10">
        {status === "loading" && <AnalyticsSkeleton />}

        {status === "error" && (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        )}

        {isEmpty && (
          <EmptyState
            title="No data yet"
            hint="Analytics will appear once photos have been processed."
          />
        )}

        {status === "ready" && photos.length > 0 && (
          <div className="flex flex-col gap-6">
            <StatsStrip stats={statCards} />

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Chart 1 — confidence distribution */}
              <ChartCard
                title="Confidence distribution"
                subtitle="All detections grouped by confidence tier"
              >
                {metrics.totalDetections === 0 ? (
                  <NoDetections />
                ) : (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={metrics.pieData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={55}
                            outerRadius={90}
                            paddingAngle={2}
                            stroke={TOKENS.surface}
                            isAnimationActive={ANIMATE}
                          >
                            {metrics.pieData.map((entry) => (
                              <Cell key={entry.name} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip {...TOOLTIP_PROPS} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="flex shrink-0 flex-col gap-2 sm:w-36">
                      {metrics.pieData.map((entry) => (
                        <li
                          key={entry.name}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="flex items-center gap-2 text-ink-muted">
                            <span
                              className="h-2.5 w-2.5 rounded-sm"
                              style={{ backgroundColor: entry.color }}
                            />
                            {entry.name}
                          </span>
                          <span className="font-mono text-ink">{entry.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </ChartCard>

              {/* Chart 2 — bibs per photo */}
              <ChartCard
                title="Bibs per photo"
                subtitle="Unique bib numbers detected in each photo"
              >
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={metrics.bibsPerPhoto}
                    margin={{ top: 8, right: 8, bottom: 8, left: -16 }}
                  >
                    <CartesianGrid stroke={TOKENS.line} vertical={false} />
                    <XAxis dataKey="name" {...AXIS_PROPS} interval="preserveStartEnd" />
                    <YAxis allowDecimals={false} {...AXIS_PROPS} />
                    <Tooltip
                      {...TOOLTIP_PROPS}
                      cursor={{ fill: "rgba(79,156,249,0.08)" }}
                    />
                    <Bar
                      dataKey="bibs"
                      name="Bibs"
                      fill={TOKENS.accent}
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={ANIMATE}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>

              {/* Chart 3 — processing time (full width) */}
              <div className="lg:col-span-2">
                <ChartCard
                  title="Processing time"
                  subtitle="Engine latency per photo (seconds)"
                >
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart
                      data={metrics.latencySeries}
                      margin={{ top: 8, right: 8, bottom: 8, left: -16 }}
                    >
                      <CartesianGrid stroke={TOKENS.line} vertical={false} />
                      <XAxis dataKey="name" {...AXIS_PROPS} interval="preserveStartEnd" />
                      <YAxis {...AXIS_PROPS} />
                      <Tooltip
                        {...TOOLTIP_PROPS}
                        cursor={{ stroke: TOKENS.line }}
                        formatter={(value) => [formatSeconds(value), "Latency"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="seconds"
                        name="Latency"
                        stroke={TOKENS.accent}
                        strokeWidth={2}
                        dot={{ fill: TOKENS.accent, r: 3 }}
                        activeDot={{ r: 5 }}
                        isAnimationActive={ANIMATE}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-line bg-surface/70 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.35)] sm:p-6">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-ink-faint">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function NoDetections() {
  return (
    <div className="flex h-[240px] items-center justify-center text-sm text-ink-faint">
      No detections recorded yet.
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[92px] rounded-xl border border-line bg-surface-2"
            style={{ animation: "pulse-soft 1.6s ease-in-out infinite" }}
          />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className={`h-[320px] rounded-2xl border border-line bg-surface-2 ${
              i === 2 ? "lg:col-span-2" : ""
            }`}
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
      <p className="text-base font-medium text-conf-low">Couldn’t load analytics</p>
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
