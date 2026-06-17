/** Compact KPI strip shown under the navbar. */
export default function StatsStrip({ stats }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="rounded-xl border border-line bg-surface/70 px-4 py-3.5"
        >
          <dt className="text-xs text-ink-faint">{stat.label}</dt>
          <dd className="mt-1 font-mono text-xl font-semibold tracking-tight text-ink">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
