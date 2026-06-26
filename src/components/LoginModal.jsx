import { useEffect, useRef, useState } from "react";
import { CloseIcon, LockIcon } from "./Icons";
import { useAuth } from "../context/auth-context";

/**
 * Admin login modal. On success it stores the token (via the auth context)
 * and calls onClose; on failure it shows an inline "Invalid credentials".
 */
export default function LoginModal({ onClose }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const usernameRef = useRef(null);

  // Escape to close, lock body scroll, focus the first field.
  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    usernameRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      onClose();
    } catch {
      // Any failure (bad creds, network) reads as a sign-in failure here.
      setError("Invalid credentials");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-canvas/80 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Admin sign in"
        onClick={(e) => e.stopPropagation()}
        className="my-12 w-full max-w-sm rounded-2xl border border-line bg-surface shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
      >
        {/* header */}
        <div className="flex items-center justify-between gap-3 border-b border-line p-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-canvas">
              <LockIcon className="h-[18px] w-[18px] text-canvas" />
            </span>
            <h2 className="text-sm font-semibold tracking-wide text-ink">
              Admin sign in
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-surface-2 text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        {/* body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 sm:p-6">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-username" className="text-xs font-medium text-ink-muted">
              Username
            </label>
            <input
              id="admin-username"
              ref={usernameRef}
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent/60 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-password" className="text-xs font-medium text-ink-muted">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent/60 focus:outline-none"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-conf-low/40 bg-conf-low/10 px-3 py-2 text-sm text-conf-low"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
