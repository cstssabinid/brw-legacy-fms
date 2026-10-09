import { getServerSession } from "next-auth";
import { AccountType } from "@prisma/client";
import { MonthClosingForm } from "@/components/month-closing-form";
import { authOptions } from "@/lib/auth";
import { isAccountAdminRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { monthLabel, rwf } from "@/lib/utils";

type MonthClosingPageProps = {
  searchParams: Promise<{ periodId?: string }>;
};

export const dynamic = "force-dynamic";

function nextPeriodParts(month: number, year: number) {
  const next = new Date(year, month, 1);
  return { month: next.getMonth() + 1, year: next.getFullYear() };
}

export default async function MonthClosingPage({ searchParams }: MonthClosingPageProps) {
  const [{ periodId }, session, periods] = await Promise.all([
    searchParams,
    getServerSession(authOptions),
    prisma.monthlyPeriod.findMany({
      include: { cashCounts: true, accountBalances: true },
      orderBy: [{ year: "desc" }, { month: "desc" }]
    })
  ]);
  const canCloseMonth = isAccountAdminRole(session?.user.role);
  const period = canCloseMonth
    ? periods.find((item) => item.id === periodId)
      ?? periods.find((item) => item.status !== "CLOSED")
      ?? periods[0]
    : periods.find((item) => item.status !== "CLOSED");

  const nextParts = period ? nextPeriodParts(period.month, period.year) : null;
  const nextPeriod = nextParts
    ? periods.find((item) => item.month === nextParts.month && item.year === nextParts.year)
    : undefined;
  const closingByType = new Map<AccountType, number>(
    period?.accountBalances.map((item): [AccountType, number] => [item.accountType, Number(item.closingBalance)]) ?? []
  );
  const defaultClosingBalances = {
    cash: period?.status === "CLOSED" ? closingByType.get("CASH") ?? 0 : period?.cashCounts.reduce((sum, item) => sum + Number(item.total), 0) ?? 0,
    momo: period?.status === "CLOSED" ? closingByType.get("MOMO") ?? 0 : 0,
    bank: period?.status === "CLOSED" ? closingByType.get("BANK") ?? 0 : 0,
    cheque: period?.status === "CLOSED" ? closingByType.get("CHEQUE") ?? 0 : 0,
    other: period?.status === "CLOSED" ? closingByType.get("OTHER") ?? 0 : 0
  };

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-2xl font-black">Month Closing</h2>
        <p className="mt-1 text-[var(--muted)]">Select a month to close or, for administrators, reclose after correcting missed transactions.</p>
      </div>
      {canCloseMonth && periods.length > 0 && (
        <form className="card flex flex-wrap items-end gap-3 p-4" method="GET">
          <label className="grid min-w-64 flex-1 gap-2">
            <span className="text-sm font-semibold text-[var(--muted)]">Accounting month</span>
            <select className="input" name="periodId" defaultValue={period?.id}>
              {periods.map((item) => <option key={item.id} value={item.id}>{monthLabel(item.month, item.year)} — {item.status}</option>)}
            </select>
          </label>
          <button className="btn btn-primary" type="submit">View month</button>
        </form>
      )}
      {!period && <p className="card p-5">No accounting month is available yet.</p>}
      {period && (
        <div className="card grid gap-3 p-5">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-black">{monthLabel(period.month, period.year)}</h3>
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-bold">{period.status}</span>
            </div>
            <p className="text-sm text-[var(--muted)]">Opening balance: {rwf(period.openingBalance.toString())}</p>
            {period.status === "CLOSED" && <p className="text-sm text-[var(--muted)]">Recorded closing balance: {rwf(period.countedClosingBalance.toString())} · Expected: {rwf(period.expectedClosingBalance.toString())} · Difference: {rwf(period.difference.toString())}</p>}
          </div>
          {period.accountBalances.length > 0 && (
            <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-5">
              {period.accountBalances.map((balance) => <p key={balance.id}><span className="text-[var(--muted)]">{balance.accountType} opening:</span> {rwf(balance.openingBalance.toString())}</p>)}
            </div>
          )}
        </div>
      )}
      {period && canCloseMonth && <MonthClosingForm
        key={period.id}
        periodId={period.id}
        periodLabel={monthLabel(period.month, period.year)}
        year={period.year}
        month={period.month}
        openingBalance={rwf(period.openingBalance.toString())}
        defaultClosingBalances={defaultClosingBalances}
        defaultClosingDate={period.closingDate?.toISOString().slice(0, 10)}
        defaultOpeningDate={nextPeriod?.openingDate?.toISOString().slice(0, 10)}
        isReclosing={period.status === "CLOSED"}
      />}
      {period && !canCloseMonth && (
        <div className="card grid gap-2 p-5">
          <p>Status: {period.status}</p>
          <p className="text-sm text-[var(--muted)]">You can review the open period and enter operational records. Only an administrator can perform the final close because closing locks the month.</p>
        </div>
      )}
    </div>
  );
}
