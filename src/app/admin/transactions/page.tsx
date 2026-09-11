import { prisma } from "@/lib/prisma";
import { monthLabel, rwf } from "@/lib/utils";
import { TransactionsTable } from "@/components/transactions-table";

type AdminTransactionsPageProps = {
  searchParams: Promise<{ periodId?: string }>;
};

export const dynamic = "force-dynamic";

export default async function AdminTransactionsPage({ searchParams }: AdminTransactionsPageProps) {
  const [{ periodId }, periods] = await Promise.all([
    searchParams,
    prisma.monthlyPeriod.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }] })
  ]);
  const selectedPeriod = periods.find((period) => period.id === periodId)
    ?? periods.find((period) => period.status === "OPEN" || period.status === "UNDER_REVIEW")
    ?? periods[0];
  const transactions = selectedPeriod
    ? await prisma.transaction.findMany({
        where: { periodId: selectedPeriod.id },
        include: { category: true, account: true, service: true, package: true, recordedBy: true },
        orderBy: [{ transactionDate: "asc" }, { createdAt: "asc" }]
      })
    : [];

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-black">Transactions by Month</h2>
        <p className="mt-1 text-[var(--muted)]">Select any accounting month to review its opening entry and all recorded transactions.</p>
      </div>
      {periods.length === 0 ? <p className="card p-5">No accounting months have been recorded yet.</p> : (
        <>
          <form className="card flex flex-wrap items-end gap-3 p-4" method="GET">
            <label className="grid min-w-64 flex-1 gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Accounting month</span><select className="input" name="periodId" defaultValue={selectedPeriod?.id}>{periods.map((period) => <option key={period.id} value={period.id}>{monthLabel(period.month, period.year)} — {period.status}</option>)}</select></label>
            <button className="btn btn-primary" type="submit">View month</button>
          </form>
          {selectedPeriod && <div className="card flex flex-wrap gap-x-8 gap-y-2 p-4 text-sm"><p><strong>{monthLabel(selectedPeriod.month, selectedPeriod.year)}</strong></p><p>Opening balance: <strong>{rwf(selectedPeriod.openingBalance.toString())}</strong></p><p>Status: <strong>{selectedPeriod.status}</strong></p></div>}
          <TransactionsTable transactions={transactions} />
        </>
      )}
    </div>
  );
}
