import { SimpleAdminPage } from "@/components/simple-admin-page";

const denominations = [100, 500, 1000, 2000, 5000, 10000];

export default function CashCountPage() {
  return (
    <SimpleAdminPage title="Cash Count">
      <div className="grid gap-3">
        {denominations.map((value) => <label className="grid gap-1 md:grid-cols-[160px_1fr] md:items-center" key={value}><strong>{value} RWF</strong><input className="input" type="number" min="0" placeholder="Quantity" /></label>)}
        <p className="text-sm text-[var(--muted)]">Month closing multiplies denomination by quantity in the closing workflow. Use this page as the dedicated counter surface.</p>
      </div>
    </SimpleAdminPage>
  );
}
