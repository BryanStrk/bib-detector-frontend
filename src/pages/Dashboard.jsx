import { useCallback, useEffect, useState } from "react";
import StatsStrip from "../components/StatsStrip";
import DetectionViewer from "../components/DetectionViewer";
import ExtractedEntities from "../components/ExtractedEntities";
import SystemLogs from "../components/SystemLogs";
import { detectBibs } from "../services/detectionApi";
import {
  normalizeDetectionResponse,
  formatSeconds,
  averageConfidence,
  timestamp,
} from "../lib/detections";
import { currentImage as demoImage, systemLogs } from "../data/mockData";
import { ENGINE_LABEL } from "../config";

let logSeq = 0;

const INITIAL_AGG = {
  photos: 0, // successful analyses this session
  bibs: 0, // total detections accumulated
  confSum: 0, // running sum of every detection's confidence (0–1)
  confCount: 0,
  latencySum: 0, // running sum of processing_time (seconds)
  latencyCount: 0,
};

export default function Dashboard() {
  // Upload / analysis state.
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null); // normalized API response
  const [status, setStatus] = useState("idle"); // idle | ready | loading | done | error
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState(systemLogs);
  const [agg, setAgg] = useState(INITIAL_AGG);

  const isDemo = status === "idle";

  // Revoke the object URL when it's replaced or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSelectFile = useCallback((selected) => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(selected);
    });
    setFile(selected);
    setResult(null);
    setError(null);
    setStatus("ready");
  }, []);

  const handleRunAnalysis = useCallback(async () => {
    if (!file) return;
    setStatus("loading");
    setError(null);

    try {
      const data = await detectBibs(file);
      const normalized = normalizeDetectionResponse(data);
      setResult(normalized);
      setStatus("done");
      setAgg((a) => ({
        photos: a.photos + 1,
        bibs: a.bibs + normalized.detections.length,
        confSum:
          a.confSum + normalized.detections.reduce((s, d) => s + d.confidence, 0),
        confCount: a.confCount + normalized.detections.length,
        latencySum: a.latencySum + (normalized.processingSeconds ?? 0),
        latencyCount: a.latencyCount + (normalized.processingSeconds != null ? 1 : 0),
      }));
      setLogs((prev) => [
        {
          id: `log-${(logSeq += 1)}`,
          timestamp: timestamp(),
          source: normalized.filename || file.name,
          detectedCount: normalized.detections.length,
          avgConfidence: averageConfidence(normalized.detections),
          processingTime: formatSeconds(normalized.processingSeconds),
          status: "Processed",
        },
        ...prev,
      ]);
    } catch (err) {
      setStatus("error");
      setError(err.message);
      setLogs((prev) => [
        {
          id: `log-${(logSeq += 1)}`,
          timestamp: timestamp(),
          source: file.name,
          detectedCount: 0,
          avgConfidence: null,
          processingTime: "—",
          status: "Failed",
        },
        ...prev,
      ]);
    }
  }, [file]);

  // What the viewer + entities panel render.
  const detections = isDemo
    ? demoImage.detections
    : status === "done" && result
      ? result.detections
      : [];

  const viewerProps = isDemo
    ? {
        filename: demoImage.filename,
        resolution: demoImage.resolution,
        processingTime: demoImage.processingTime,
        model: ENGINE_LABEL,
      }
    : {
        filename: result?.filename ?? file?.name ?? "upload",
        resolution: null,
        processingTime: formatSeconds(result?.processingSeconds),
        model: ENGINE_LABEL,
      };

  // KPI cards computed live from this session's analyses.
  const statCards = [
    { id: "photos", label: "Photos Processed", value: String(agg.photos) },
    { id: "bibs", label: "Bibs Detected", value: agg.bibs.toLocaleString() },
    {
      id: "conf",
      label: "Avg Confidence",
      value: agg.confCount
        ? `${((agg.confSum / agg.confCount) * 100).toFixed(1)}%`
        : "0.0%",
    },
    {
      id: "latency",
      label: "Avg Latency",
      value: agg.latencyCount
        ? `${(agg.latencySum / agg.latencyCount).toFixed(2)}s`
        : "0.00s",
    },
  ];

  return (
    <main id="main" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {/* Page heading */}
      <div id="dashboard" className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Detection Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-base text-ink-muted">
            Upload race photos and extract athlete bib numbers in real time.
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs text-ink-muted">
          <span
            className="h-1.5 w-1.5 rounded-full bg-conf-high"
            style={{ animation: "pulse-soft 1.8s ease-in-out infinite" }}
          />
          Engine online
        </span>
      </div>

      {/* Stats */}
      <div className="mt-8 sm:mt-10">
        <StatsStrip stats={statCards} />
      </div>

      {/* Two-column work area */}
      <div className="mt-8 grid gap-6 sm:mt-10 lg:grid-cols-[1.65fr_1fr]">
        <DetectionViewer
          isDemo={isDemo}
          imageUrl={previewUrl}
          detections={detections}
          status={status}
          error={error}
          onSelectFile={handleSelectFile}
          onRunAnalysis={handleRunAnalysis}
          {...viewerProps}
        />
        <ExtractedEntities detections={detections} />
      </div>

      {/* Full-width logs */}
      <div className="mt-8 sm:mt-10">
        <SystemLogs logs={logs} />
      </div>
    </main>
  );
}
