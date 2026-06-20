import { useCallback, useMemo, useState } from "react";
import { login as loginRequest } from "../services/detectionApi";
import LoginModal from "../components/LoginModal";
import { AuthContext } from "./auth-context";

const STORAGE_KEY = "bib-detector.admin-token";

/** Read the persisted token once at startup (guards against SSR/no-storage). */
function readStoredToken() {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(readStoredToken);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  const persist = useCallback((next) => {
    setToken(next);
    try {
      if (next) localStorage.setItem(STORAGE_KEY, next);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // storage unavailable (private mode etc.) — keep the in-memory token
    }
  }, []);

  // Authenticate and store the JWT. Throws on bad credentials / network error
  // so the caller can surface an inline message.
  const login = useCallback(
    async (username, password) => {
      const accessToken = await loginRequest(username, password);
      persist(accessToken);
      return accessToken;
    },
    [persist],
  );

  const logout = useCallback(() => persist(null), [persist]);

  const openLoginPrompt = useCallback(() => setLoginPromptOpen(true), []);
  const closeLoginPrompt = useCallback(() => setLoginPromptOpen(false), []);

  const value = useMemo(
    () => ({
      token,
      isAdmin: Boolean(token),
      login,
      logout,
      openLoginPrompt,
    }),
    [token, login, logout, openLoginPrompt],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {loginPromptOpen && <LoginModal onClose={closeLoginPrompt} />}
    </AuthContext.Provider>
  );
}
