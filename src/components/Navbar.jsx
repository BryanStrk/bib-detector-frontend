import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ScanIcon,
  BellIcon,
  SettingsIcon,
  ClockIcon,
  MenuIcon,
  CloseIcon,
  LockIcon,
} from "./Icons";
import { useAuth } from "../context/auth-context";
import { useSettings } from "../context/settings-context";
import { getPhotos, getEvents } from "../services/detectionApi";
import { normalizePhoto, formatDate } from "../lib/detections";

// Route links use the router (with active state); the rest are in-page anchors
// that scroll to dashboard sections, matching the prior behavior.
const NAV_ITEMS = [
  { label: "Dashboard", to: "/" },
  { label: "Gallery", to: "/gallery" },
  { label: "History", to: "/history" },
  { label: "Analytics", to: "/analytics" },
];

function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none"
      aria-label="Bib Detector home"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-canvas">
        <ScanIcon className="h-5 w-5 text-canvas" />
      </span>
      <span className="text-[15px] font-bold tracking-[0.18em] text-ink">
        BIB<span className="text-accent"> DETECTOR</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAdmin, logout, openLoginPrompt } = useAuth();

  return (
    <header
      id="top"
      className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-xl"
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
        aria-label="Primary"
      >
        <Logo />

        {/* Desktop nav links */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <NavItem item={item} />
            </li>
          ))}
        </ul>

        {/* Right cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            to="/claim"
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-canvas transition-colors hover:bg-accent-strong"
          >
            <ScanIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Claim photos</span>
          </Link>

          <NotificationsMenu />
          <SettingsMenu />

          {isAdmin ? (
            <button
              type="button"
              onClick={logout}
              className="ml-1 inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
            >
              Logout
            </button>
          ) : (
            <button
              type="button"
              onClick={openLoginPrompt}
              className="ml-1 inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
            >
              <LockIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="ml-1 grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-ink-muted transition-colors hover:text-ink md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileOpen ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <ul
          id="mobile-nav"
          className="flex flex-col gap-1 border-t border-line bg-surface px-4 py-3 md:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <NavItem item={item} mobile onNavigate={() => setMobileOpen(false)} />
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}

function NavItem({ item, mobile = false, onNavigate }) {
  // In-page anchor (item with `href`) — never shows route-active.
  if (item.href) {
    return (
      <a
        href={item.href}
        onClick={onNavigate}
        className={
          mobile
            ? "block rounded-lg px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
            : "relative rounded-lg px-3.5 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
        }
      >
        {item.label}
      </a>
    );
  }

  // Routed link with active styling.
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      onClick={onNavigate}
      className={({ isActive }) =>
        mobile
          ? `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              isActive ? "bg-accent-soft text-ink" : "text-ink-muted hover:bg-surface-2 hover:text-ink"
            }`
          : `relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
              isActive ? "text-ink" : "text-ink-muted hover:text-ink"
            }`
      }
    >
      {({ isActive }) => (
        <>
          {item.label}
          {!mobile && isActive && (
            <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-accent" />
          )}
        </>
      )}
    </NavLink>
  );
}

// Pull the list out of whatever envelope getPhotos/getEvents returns.
function extractActivityList(data) {
  return Array.isArray(data)
    ? data
    : (data?.photos ?? data?.events ?? data?.results ?? data?.items ?? data?.data ?? []);
}

/** Epoch ms for sorting; 0 for missing/unparseable dates. */
function dateValue(value) {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function truncate(str, max = 28) {
  if (!str) return "—";
  return str.length > max ? `${str.slice(0, max)}…` : str;
}

// Bell button + popover of recent activity (photos scanned, events created).
// Admin-only and lazy-loaded the first time it's opened.
function NotificationsMenu() {
  const { isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const [items, setItems] = useState([]);
  const wrapperRef = useRef(null);
  const loadedRef = useRef(false);

  // Close on outside click or Escape while the popover is open.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Lazy-load activity the first time the popover opens.
  useEffect(() => {
    if (!open || loadedRef.current) return undefined;
    loadedRef.current = true;
    setStatus("loading");

    let cancelled = false;
    Promise.allSettled([getPhotos({ limit: 5 }), getEvents()]).then(
      ([photosRes, eventsRes]) => {
        if (cancelled) return;

        if (photosRes.status === "rejected" && eventsRes.status === "rejected") {
          setStatus("error");
          return;
        }

        const photoItems =
          photosRes.status === "fulfilled"
            ? extractActivityList(photosRes.value)
                .map(normalizePhoto)
                .filter(Boolean)
                .map((p) => ({
                  id: `photo-${p.id}`,
                  kind: "photo",
                  label: p.filename,
                  date: p.createdAt,
                }))
            : [];

        const eventItems =
          eventsRes.status === "fulfilled"
            ? extractActivityList(eventsRes.value).map((e, i) => ({
                id: `event-${e.id ?? e._id ?? i}`,
                kind: "event",
                label: e.name ?? e.title ?? e.slug ?? "Event",
                date: e.created_at ?? e.createdAt ?? e.created ?? e.event_date ?? null,
              }))
            : [];

        const merged = [...photoItems, ...eventItems]
          .sort((a, b) => dateValue(b.date) - dateValue(a.date))
          .slice(0, 8);

        setItems(merged);
        setStatus("ready");
      },
    );

    return () => {
      cancelled = true;
    };
  }, [open]);

  // Hooks run unconditionally above; the bell only renders for admins.
  if (!isAdmin) return null;

  const hasActivity = items.length > 0;

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
      >
        <BellIcon className="h-[18px] w-[18px]" />
        {hasActivity && (
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent ring-2 ring-surface" />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Recent activity"
          className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-line bg-surface shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
        >
          <p className="border-b border-line px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-ink-faint">
            Recent activity
          </p>

          {status === "loading" && (
            <ul className="p-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="px-2 py-2">
                  <div
                    className="h-8 w-full rounded bg-surface-2"
                    style={{ animation: "pulse-soft 1.6s ease-in-out infinite" }}
                  />
                </li>
              ))}
            </ul>
          )}

          {status === "error" && (
            <p className="px-4 py-8 text-center text-sm text-ink-muted">
              Couldn’t load activity
            </p>
          )}

          {status === "ready" && !hasActivity && (
            <p className="px-4 py-8 text-center text-sm text-ink-faint">
              No recent activity
            </p>
          )}

          {status === "ready" && hasActivity && (
            <ul className="max-h-96 overflow-y-auto py-1">
              {items.map((item) => (
                <li key={item.id}>
                  <div className="flex items-start gap-3 border-b border-line/60 px-4 py-2.5 transition-colors last:border-0 hover:bg-surface-2/50">
                    <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md border border-line bg-surface-2 text-ink-muted">
                      {item.kind === "photo" ? (
                        <ScanIcon className="h-4 w-4" />
                      ) : (
                        <ClockIcon className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-ink">
                        {item.kind === "photo" ? "Photo scanned" : "Event created"}
                      </p>
                      <p className="truncate text-xs text-ink-muted" title={item.label}>
                        {truncate(item.label)}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-xs text-ink-faint">
                      {formatDate(item.date)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// Gear button + popover for global detection settings (minimum confidence).
function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const { minConfidence, setMinConfidence } = useSettings();
  const wrapperRef = useRef(null);

  // Close on outside click or Escape while the popover is open.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (!wrapperRef.current?.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const pct = Math.round(minConfidence * 100);

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Settings"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
      >
        <SettingsIcon className="h-[18px] w-[18px]" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Detection settings"
          className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-line bg-surface p-4 shadow-[0_16px_48px_rgba(0,0,0,0.5)]"
        >
          <p className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
            Detection settings
          </p>

          <div className="mt-3 flex items-center justify-between">
            <label htmlFor="min-confidence" className="text-sm font-medium text-ink">
              Minimum confidence
            </label>
            <span className="font-mono text-sm text-ink">{pct}%</span>
          </div>

          <input
            id="min-confidence"
            type="range"
            min={0}
            max={100}
            step={5}
            value={pct}
            onChange={(e) => setMinConfidence(Number(e.target.value) / 100)}
            aria-label="Minimum confidence threshold"
            className="mt-3 w-full accent-accent"
          />

          <p className="mt-2 text-xs text-ink-faint">
            Detections below this confidence are hidden.
          </p>
        </div>
      )}
    </div>
  );
}
