import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getEvents, requestClaim } from "../services/detectionApi";

// Always shown after a submit — never reveals whether the details matched.
const NEUTRAL_MESSAGE =
  "If the details match, you'll receive an email shortly.";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Claim() {
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get("expired") != null;

  const [events, setEvents] = useState([]);
  const [eventsStatus, setEventsStatus] = useState("loading"); // loading | ready | error

  const [eventId, setEventId] = useState("");
  const [bibNumber, setBibNumber] = useState("");
  const [email, setEmail] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // Load the public events list for the dropdown.
  useEffect(() => {
    let cancelled = false;
    getEvents()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : (data?.events ?? []);
        setEvents(list);
        setEventsStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setEventsStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSubmit() {
    setError(null);

    if (!eventId || !bibNumber.trim() || !email.trim()) {
      setError("Please fill in the event, bib number, and email.");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);
    requestClaim({ eventId, bibNumber: bibNumber.trim(), email: email.trim() })
      .then(() => setSubmitted(true))
      .catch((err) => setError(err.message || "Something went wrong."))
      .finally(() => setSubmitting(false));
  }

  return (
    <main id="main" className="mx-auto max-w-lg px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Claim your race photos
        </h1>
        <p className="mt-2 text-sm text-ink-muted">
          Pick your event, enter your bib number and email. We&apos;ll send you a
          secure link to view the photos you appear in.
        </p>
      </div>

      {sessionExpired && !submitted && (
        <p
          role="status"
          className="mt-6 rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink-muted"
        >
          Your session expired. Request a new link below to continue.
        </p>
      )}

      <div className="mt-8 rounded-2xl border border-line bg-surface/70 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.35)] sm:p-6">
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-soft font-mono text-lg text-accent-cyan">
              ✓
            </span>
            <p className="text-base font-medium text-ink">Check your inbox</p>
            <p className="max-w-sm text-sm text-ink-muted">{NEUTRAL_MESSAGE}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* event */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="claim-event" className="text-xs font-medium text-ink-muted">
                Event
              </label>
              <select
                id="claim-event"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                disabled={eventsStatus !== "ready"}
                className="w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink focus:border-accent-cyan/60 focus:outline-none disabled:opacity-60"
              >
                <option value="">
                  {eventsStatus === "loading"
                    ? "Loading events…"
                    : eventsStatus === "error"
                      ? "Couldn't load events"
                      : "Select an event…"}
                </option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>

            {/* bib number */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="claim-bib" className="text-xs font-medium text-ink-muted">
                Bib number
              </label>
              <input
                id="claim-bib"
                type="text"
                inputMode="numeric"
                value={bibNumber}
                onChange={(e) => setBibNumber(e.target.value)}
                placeholder="e.g. 1042"
                className="w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 font-mono text-sm text-ink placeholder:font-sans placeholder:text-ink-faint focus:border-accent-cyan/60 focus:outline-none"
              />
            </div>

            {/* email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="claim-email" className="text-xs font-medium text-ink-muted">
                Email
              </label>
              <input
                id="claim-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-accent-cyan/60 focus:outline-none"
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
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-cyan px-4 py-2.5 text-sm font-semibold text-canvas shadow-[0_4px_18px_rgba(34,211,238,0.3)] transition-[filter] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Send me the link"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
