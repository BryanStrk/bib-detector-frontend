import Navbar from "./components/Navbar";
import StatsStrip from "./components/StatsStrip";
import DetectionViewer from "./components/DetectionViewer";
import ExtractedEntities from "./components/ExtractedEntities";
import SystemLogs from "./components/SystemLogs";
import Footer from "./components/Footer";
import { currentImage, systemLogs, stats } from "./data/mockData";

export default function App() {
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
          <DetectionViewer image={currentImage} />
          <ExtractedEntities detections={currentImage.detections} />
        </div>

        {/* Full-width logs */}
        <div className="mt-6">
          <SystemLogs logs={systemLogs} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
