import { createContext, useContext } from "react";

/** Shared auth context. The provider lives in AuthContext.jsx. */
export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return ctx;
}
