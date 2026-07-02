export function SimpleAdminPage({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-black">{title}</h2>
      <section className="card p-5">{children ?? <p className="text-[var(--muted)]">CRUD foundation page ready for database-backed management.</p>}</section>
    </div>
  );
}
