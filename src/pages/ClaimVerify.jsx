import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { verifyClaim } from "../services/detectionApi";
import { setRunnerToken } from "../context/runner-auth";

export default function ClaimVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  // A missing token is known at render time — no token means an invalid link.
  const [status, setStatus] = useState(token ? "verifying" : "error"); // verifying | error
  const [error, setError] = useState("Invalid link");

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;

    verifyClaim(token)
      .then((accessToken) => {
        if (cancelled) return;
        setRunnerToken(accessToken);
        navigate("/my-photos", { replace: true });
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || "Invalid or expired link");
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [token, navigate]);

  return (
    <main id="main" className="mx-auto max-w-md px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-line bg-surface/70 p-8 text-center shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
        {status === "verifying" ? (
          <div className="flex flex-col items-center gap-4">
            <span
              className="h-9 w-9 rounded-full border-2 border-line border-t-accent"
              style={{ animation: "spin 0.8s linear infinite" }}
            />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <p className="text-sm text-ink-muted">Verifying your link…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-conf-low/20 font-mono text-lg font-bold text-conf-low">
              !
            </span>
            <p className="text-base font-medium text-conf-low">{error}</p>
            <p className="max-w-sm text-sm text-ink-muted">
              This link may have already been used or expired. Request a fresh
              one to continue.
            </p>
            <Link
              to="/claim"
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-accent-strong"
            >
              Request a new link
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
