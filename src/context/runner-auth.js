// Lightweight runner-session storage. Unlike the admin auth (a full React
// context), the runner token is read/written imperatively from the claim
// pages — so a few localStorage helpers are all we need.

const STORAGE_KEY = "bib-detector.runner-token";

/** Read the persisted runner token (null when absent or storage is blocked). */
export function getRunnerToken() {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

/** Persist (or, with a falsy value, remove) the runner token. */
export function setRunnerToken(token) {
  try {
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable (private mode etc.) — nothing else we can do
  }
}

/** Forget the runner session. */
export function clearRunnerToken() {
  setRunnerToken(null);
}
