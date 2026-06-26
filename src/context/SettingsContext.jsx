import { useCallback, useMemo, useState } from "react";
import { SettingsContext } from "./settings-context";

const STORAGE_KEY = "bib-detector.min-confidence";
const DEFAULT_MIN_CONFIDENCE = 0.5;

/** Read the persisted threshold once at startup (guards against no-storage). */
function readStoredMinConfidence() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) return DEFAULT_MIN_CONFIDENCE;
    const value = Number(raw);
    // Ignore corrupt/out-of-range values and fall back to the default.
    return Number.isFinite(value) && value >= 0 && value <= 1
      ? value
      : DEFAULT_MIN_CONFIDENCE;
  } catch {
    return DEFAULT_MIN_CONFIDENCE;
  }
}

export function SettingsProvider({ children }) {
  const [minConfidence, setMinConfidenceState] = useState(readStoredMinConfidence);

  const setMinConfidence = useCallback((next) => {
    setMinConfidenceState(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // storage unavailable (private mode etc.) — keep the in-memory value
    }
  }, []);

  const value = useMemo(
    () => ({ minConfidence, setMinConfidence }),
    [minConfidence, setMinConfidence],
  );

  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}
