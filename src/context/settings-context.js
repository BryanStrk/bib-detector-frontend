import { createContext, useContext } from "react";

/** Shared settings context. The provider lives in SettingsContext.jsx. */
export const SettingsContext = createContext(null);

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a <SettingsProvider>");
  }
  return ctx;
}
