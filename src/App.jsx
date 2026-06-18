import { useCallback, useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import StatsStrip from "./components/StatsStrip";
import DetectionViewer from "./components/DetectionViewer";
import ExtractedEntities from "./components/ExtractedEntities";
import SystemLogs from "./components/SystemLogs";
import Footer from "./components/Footer";
import { detectBibs } from "./services/detectionApi";
import {
  normalizeDetectionResponse,
  formatSeconds,
  averageConfidence,
  timestamp,
} from "./lib/detections";
import { currentImage as demoImage, systemLogs, stats } from "./data/mockData";

let logSeq = 0;

export default function App() {
  // Upload / analysis state.
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null); // normalized API response
  const [status, setStatus] = useState("idle"); // idle | ready | loading | done | error
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState(systemLogs);

  const isDemo = status === "idle";

  // Revoke the object URL when it's replaced or the component unmounts.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSelectFile = useCallback(
    (selected) => {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(selected);
      });
      setFile(selected);
      setResult(null);
      setError(null);
      setStatus("ready");
    },
    [],
  );

  const handleRunAnalysis = useCallback(async () => {
    if (!file) return;
    setStatus("loading");
    setError(null);

    try {
      const data = await detectBibs(file);
      const normalized = normalizeDetectionResponse(data);
      setResult(normalized);
      setStatus("done");
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
        model: demoImage.model,
      }
    : {
        filename: result?.filename ?? file?.name ?? "upload",
        resolution: null,
        processingTime: formatSeconds(result?.processingSeconds),
        model: demoImage.model,
      };

  return (
    <div className="min-h-screen text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-canvas"
      >
        Skip to content
      </a>

      <Navbar />

      <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Page heading */}
        <div id="dashboard" className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Detection Dashboard
            </h1>
            <p className="mt-1.5 text-sm text-ink-muted">
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
        <div className="mt-6">
          <StatsStrip stats={stats} />
        </div>

        {/* Two-column work area */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.65fr_1fr]">
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
        <div className="mt-6">
          <SystemLogs logs={logs} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
