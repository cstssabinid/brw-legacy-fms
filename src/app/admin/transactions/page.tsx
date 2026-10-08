import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { monthLabel, rwf } from "@/lib/utils";
import { TransactionsTable } from "@/components/transactions-table";
import { authOptions } from "@/lib/auth";
import { isAccountAdminRole } from "@/lib/permissions";

type AdminTransactionsPageProps = {
  searchParams: Promise<{ periodId?: string }>;
};

export const dynamic = "force-dynamic";

export default async function AdminTransactionsPage({ searchParams }: AdminTransactionsPageProps) {
  const [{ periodId }, periods, session] = await Promise.all([
    searchParams,
    prisma.monthlyPeriod.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }] }),
    getServerSession(authOptions)
  ]);
  const selectedPeriod = periods.find((period) => period.id === periodId)
    ?? periods.find((period) => period.status === "OPEN" || period.status === "UNDER_REVIEW")
    ?? periods[0];
  const transactions = selectedPeriod
    ? await prisma.transaction.findMany({
        where: { periodId: selectedPeriod.id },
        select: {
          id: true,
          periodId: true,
          type: true,
          paymentMethod: true,
          amount: true,
          transactionDate: true,
          comments: true,
          description: true,
          isOpeningBalance: true,
          status: true,
          category: { select: { name: true } },
          service: { select: { name: true } },
          package: { select: { name: true } },
          recordedBy: { select: { name: true } },
          period: { select: { status: true } }
        },
        orderBy: [{ transactionDate: "asc" }, { createdAt: "asc" }]
      })
    : [];
  const serializableTransactions = transactions.map((transaction) => ({
    ...transaction,
    amount: transaction.amount.toString(),
    transactionDate: transaction.transactionDate.toISOString()
  }));
  const canEdit = isAccountAdminRole(session?.user.role) && Boolean(selectedPeriod);
  const periodOptions = canEdit ? periods.map(({ id, month, year, status }) => ({ id, month, year, status })) : [];
  const categories = canEdit
    ? await prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" }, select: { id: true, name: true, type: true } })
    : [];

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-black">Transactions by Month</h2>
        <p className="mt-1 text-[var(--muted)]">Select a month to review transactions. Administrators can edit and move entries between months. A closed-month correction requires a reason and updates the expected balance and difference while preserving the recorded count.</p>
      </div>
      {periods.length === 0 ? <p className="card p-5">No accounting months have been recorded yet.</p> : (
        <>
          <form className="card flex flex-wrap items-end gap-3 p-4" method="GET">
            <label className="grid min-w-64 flex-1 gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Accounting month</span><select className="input" name="periodId" defaultValue={selectedPeriod?.id}>{periods.map((period) => <option key={period.id} value={period.id}>{monthLabel(period.month, period.year)} — {period.status}</option>)}</select></label>
            <button className="btn btn-primary" type="submit">View month</button>
          </form>
          {selectedPeriod && <div className="card flex flex-wrap gap-x-8 gap-y-2 p-4 text-sm"><p><strong>{monthLabel(selectedPeriod.month, selectedPeriod.year)}</strong></p><p>Opening balance: <strong>{rwf(selectedPeriod.openingBalance.toString())}</strong></p><p>Status: <strong>{selectedPeriod.status}</strong></p>{selectedPeriod.status === "CLOSED" && <><p>Expected closing balance: <strong>{rwf(selectedPeriod.expectedClosingBalance.toString())}</strong></p><p>Recorded closing balance: <strong>{rwf(selectedPeriod.countedClosingBalance.toString())}</strong></p><p>Difference: <strong>{rwf(selectedPeriod.difference.toString())}</strong></p></>}</div>}
          <TransactionsTable transactions={serializableTransactions} periods={periodOptions} categories={categories} canEdit={canEdit} />
        </>
      )}
    </div>
  );
}
