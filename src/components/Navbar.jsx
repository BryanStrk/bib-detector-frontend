import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ScanIcon, BellIcon, SettingsIcon, MenuIcon, CloseIcon, UserIcon } from "./Icons";

// Route links use the router (with active state); the rest are in-page anchors
// that scroll to dashboard sections, matching the prior behavior.
const NAV_ITEMS = [
  { label: "Dashboard", to: "/" },
  { label: "Gallery", to: "/gallery" },
  { label: "History", href: "/#history" },
  { label: "Analytics", href: "/#analytics" },
  { label: "Archives", href: "/#archives" },
];

function Logo() {
  return (
    <Link
      to="/"
      className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none"
      aria-label="Bib Detector home"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-cyan text-canvas shadow-[0_4px_16px_rgba(34,211,238,0.35)]">
        <ScanIcon className="h-5 w-5 text-canvas" />
      </span>
      <span className="text-[15px] font-bold tracking-[0.18em] text-ink">
        BIB<span className="text-accent-cyan"> DETECTOR</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <IconButton label="Notifications" badge>
            <BellIcon className="h-[18px] w-[18px]" />
          </IconButton>
          <IconButton label="Settings">
            <SettingsIcon className="h-[18px] w-[18px]" />
          </IconButton>

          <button
            type="button"
            className="ml-1 grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
            aria-label="Account"
          >
            <UserIcon className="h-[18px] w-[18px]" />
          </button>

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
  // In-page anchor (History/Analytics/Archives) — never shows route-active.
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
            <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-gradient-to-r from-accent to-accent-cyan" />
          )}
        </>
      )}
    </NavLink>
  );
}

function IconButton({ children, label, badge = false }) {
  return (
    <button
      type="button"
      aria-label={label}
      className="relative grid h-9 w-9 place-items-center rounded-lg border border-line bg-surface text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
    >
      {children}
      {badge && (
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-accent-cyan ring-2 ring-surface" />
      )}
    </button>
  );
}
