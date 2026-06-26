import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";

// Lazy-loaded routes keep heavy deps (e.g. Recharts in Analytics) out of the
// initial bundle. Dashboard stays static so the home renders instantly.
const Gallery = lazy(() => import("./pages/Gallery"));
const Claim = lazy(() => import("./pages/Claim"));
const ClaimVerify = lazy(() => import("./pages/ClaimVerify"));
const MyPhotos = lazy(() => import("./pages/MyPhotos"));
const History = lazy(() => import("./pages/History"));
const Analytics = lazy(() => import("./pages/Analytics"));

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

      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-20 text-center text-sm text-ink-muted">
            Loading…
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/claim" element={<Claim />} />
          <Route path="/claim/verify" element={<ClaimVerify />} />
          <Route path="/my-photos" element={<MyPhotos />} />
          <Route path="/history" element={<History />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Suspense>

      <Footer />
    </div>
  );
}
