export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="card p-5">
      <p className="text-sm font-bold text-[var(--muted)]">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
      {hint && <p className="mt-2 text-sm text-[var(--muted)]">{hint}</p>}
    </article>
  );
}
