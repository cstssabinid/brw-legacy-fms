import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { rwf, monthLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const periods = await prisma.monthlyPeriod.findMany({
    include: { transactions: { include: { service: true } } },
    orderBy: [{ year: "desc" }, { month: "desc" }]
  });

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-black">Monthly Reports</h2>
        <p className="mt-1 text-[var(--muted)]">Each accounting month keeps its own opening balance, activity, and closing record.</p>
      </div>
      {periods.length === 0 && <p className="card p-5">No accounting months have been recorded yet.</p>}
      <div className="responsive-grid">
        {periods.map((period) => {
          const confirmed = period.transactions.filter((transaction) => transaction.status === "CONFIRMED");
          const operatingIncome = confirmed.filter((transaction) => transaction.type === "INCOME" && !transaction.isOpeningBalance).reduce((sum, transaction) => sum + Number(transaction.amount), 0);
          const expenses = confirmed.filter((transaction) => transaction.type === "EXPENSE").reduce((sum, transaction) => sum + Number(transaction.amount), 0);
          const adjustments = confirmed.filter((transaction) => transaction.type === "ADJUSTMENT").reduce((sum, transaction) => sum + Number(transaction.amount), 0);
          const eventCoverage = confirmed.filter((transaction) => transaction.type === "INCOME" && !transaction.isOpeningBalance && transaction.service?.name === "Event Coverage").reduce((sum, transaction) => sum + Number(transaction.amount), 0);
          const expectedClosing = Number(period.openingBalance) + operatingIncome - expenses + adjustments;
          const closingBalance = period.status === "CLOSED" ? Number(period.countedClosingBalance) : expectedClosing;

          return (
            <article className="card grid gap-2 p-5" key={period.id}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-black">{monthLabel(period.month, period.year)}</h3>
                <span className="rounded-full border border-[var(--border)] px-2 py-1 text-xs font-bold">{period.status}</span>
              </div>
              <p>Opening balance: {rwf(period.openingBalance.toString())}</p>
              <p>Operating income: {rwf(operatingIncome)}</p>
              <p>Event Coverage: {rwf(eventCoverage)}</p>
              <p>Expenses: {rwf(expenses)}</p>
              {adjustments !== 0 && <p>Adjustments: {rwf(adjustments)}</p>}
              <p className="font-bold">{period.status === "CLOSED" ? "Recorded closing balance" : "Expected closing balance"}: {rwf(closingBalance)}</p>
              {period.status === "CLOSED" && <p className="text-sm text-[var(--muted)]">Difference: {rwf(period.difference.toString())}</p>}
              <div className="mt-2 flex flex-wrap gap-2">
                <Link className="btn btn-primary" href={`/admin/transactions?periodId=${period.id}`}>View transactions</Link>
                <a className="btn border border-[var(--border)]" href={`/api/reports/monthly?periodId=${period.id}`}>Export CSV</a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
