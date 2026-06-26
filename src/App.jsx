import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Gallery from "./pages/Gallery";
import Claim from "./pages/Claim";
import ClaimVerify from "./pages/ClaimVerify";
import MyPhotos from "./pages/MyPhotos";
import History from "./pages/History";
import Analytics from "./pages/Analytics";

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

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/claim" element={<Claim />} />
        <Route path="/claim/verify" element={<ClaimVerify />} />
        <Route path="/my-photos" element={<MyPhotos />} />
        <Route path="/history" element={<History />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>

      <Footer />
    </div>
  );
}
