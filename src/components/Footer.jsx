import { ScanIcon } from "./Icons";

const LINK_GROUPS = [
  { heading: "Product", links: ["Detection Engine", "Batch Processing", "API Access", "Changelog"] },
  { heading: "Resources", links: ["Documentation", "Model Cards", "Status", "Support"] },
  { heading: "Company", links: ["About", "Privacy", "Terms", "Contact"] },
];

export default function Footer() {
  return (
    <footer className="mt-4 border-t border-line">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent">
                <ScanIcon className="h-[18px] w-[18px] text-canvas" />
              </span>
              <span className="text-sm font-bold tracking-[0.18em] text-ink">
                BIB<span className="text-accent"> DETECTOR</span>
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-muted">
              Computer-vision bib recognition for race and sports photography.
              Fast, accurate, batch-ready.
            </p>
          </div>

          {LINK_GROUPS.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-ink-faint">
                {group.heading}
              </h3>
              <ul className="mt-3 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#top"
                      className="text-sm text-ink-muted transition-colors hover:text-accent"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 sm:flex-row">
          <p className="font-mono text-xs text-ink-faint">
            © 2026 Bib Detector. All rights reserved.
          </p>
          <p className="flex items-center gap-2 font-mono text-xs text-ink-faint">
            <span
              className="h-1.5 w-1.5 rounded-full bg-conf-high"
              style={{ animation: "pulse-soft 1.8s ease-in-out infinite" }}
            />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}
