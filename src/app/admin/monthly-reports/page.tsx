import { prisma } from "@/lib/prisma";
import { rwf, monthLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const periods = await prisma.monthlyPeriod.findMany({ include: { transactions: { include: { service: true } } }, orderBy: [{ year: "desc" }, { month: "desc" }] });
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-black">Monthly Reports</h2>
      <div className="responsive-grid">
        {periods.map((period) => {
          const income = period.transactions.filter((tx) => tx.type === "INCOME" && tx.status === "CONFIRMED").reduce((sum, tx) => sum + Number(tx.amount), 0);
          const expenses = period.transactions.filter((tx) => tx.type === "EXPENSE" && tx.status === "CONFIRMED").reduce((sum, tx) => sum + Number(tx.amount), 0);
          const eventCoverage = period.transactions.filter((tx) => tx.type === "INCOME" && tx.status === "CONFIRMED" && tx.service?.name === "Event Coverage").reduce((sum, tx) => sum + Number(tx.amount), 0);
          return <article className="card p-5" key={period.id}><h3 className="font-black">{monthLabel(period.month, period.year)}</h3><p className="mt-2">Income: {rwf(income)}</p><p>Event Coverage: {rwf(eventCoverage)}</p><p>Expenses: {rwf(expenses)}</p><p>Net: {rwf(income - expenses)}</p><p>Status: {period.status}</p><a className="btn btn-primary mt-4" href={`/api/reports/monthly?periodId=${period.id}`}>Export CSV</a></article>;
        })}
      </div>
    </div>
  );
}
