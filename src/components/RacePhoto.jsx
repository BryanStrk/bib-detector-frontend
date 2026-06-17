// Self-contained SVG stand-in for an uploaded race photo, so the viewer
// renders meaningfully without a network asset. The bounding-box overlays
// in DetectionViewer are positioned to sit over these runner figures.

function Runner({ x, jersey, skin, shorts, scale = 1 }) {
  return (
    <g transform={`translate(${x} 0) scale(${scale})`}>
      {/* head */}
      <circle cx="0" cy="92" r="9" fill={skin} />
      {/* torso / jersey with a bib square */}
      <rect x="-13" y="103" width="26" height="34" rx="6" fill={jersey} />
      <rect x="-9" y="110" width="18" height="14" rx="2" fill="#f8fafc" />
      {/* arms */}
      <rect x="-19" y="104" width="7" height="26" rx="3.5" fill={jersey} />
      <rect x="12" y="104" width="7" height="26" rx="3.5" fill={jersey} />
      {/* legs */}
      <rect x="-11" y="136" width="9" height="30" rx="4" fill={shorts} />
      <rect x="2" y="136" width="9" height="30" rx="4" fill={shorts} />
      {/* shoes */}
      <rect x="-12" y="164" width="12" height="6" rx="3" fill="#0b0e14" />
      <rect x="2" y="164" width="12" height="6" rx="3" fill="#0b0e14" />
    </g>
  );
}

export default function RacePhoto({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Race photo: four runners crossing the finish line, each wearing a numbered bib."
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a3550" />
          <stop offset="100%" stopColor="#1a2236" />
        </linearGradient>
        <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a4256" />
          <stop offset="100%" stopColor="#212636" />
        </linearGradient>
      </defs>

      {/* sky + distant haze */}
      <rect width="400" height="300" fill="url(#sky)" />
      <circle cx="320" cy="60" r="120" fill="#3b82f6" opacity="0.12" />
      <circle cx="70" cy="40" r="90" fill="#22d3ee" opacity="0.08" />

      {/* crowd silhouette band */}
      <rect x="0" y="150" width="400" height="40" fill="#161d2e" opacity="0.7" />

      {/* road */}
      <rect x="0" y="178" width="400" height="122" fill="url(#road)" />
      {/* lane markings */}
      <g stroke="#4b5468" strokeWidth="3" strokeDasharray="14 12" opacity="0.5">
        <line x1="0" y1="230" x2="400" y2="230" />
      </g>
      {/* finish line */}
      <rect x="0" y="196" width="400" height="8" fill="#0b0e14" opacity="0.55" />

      {/* runners */}
      <Runner x="78" skin="#e0b48c" jersey="#3b82f6" shorts="#1e293b" scale="1.05" />
      <Runner x="190" skin="#c98c6a" jersey="#22d3ee" shorts="#0f172a" scale="1" />
      <Runner x="300" skin="#e8c39e" jersey="#f87171" shorts="#1e293b" scale="1.02" />
      <Runner x="370" skin="#caa078" jersey="#fbbf24" shorts="#0f172a" scale="0.82" />
    </svg>
  );
}
