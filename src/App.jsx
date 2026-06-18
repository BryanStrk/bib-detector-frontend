import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import Gallery from "./pages/Gallery";

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
      </Routes>

      <Footer />
    </div>
  );
}
