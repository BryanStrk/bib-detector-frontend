/** Compact KPI strip shown under the navbar. */
export default function StatsStrip({ stats }) {
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.id}
          className="rounded-xl border border-line bg-surface/70 px-5 py-5 transition-colors hover:border-line-strong"
        >
          <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">
            {stat.label}
          </dt>
          <dd className="mt-2 font-mono text-2xl font-semibold tracking-tight text-ink sm:text-4xl">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
