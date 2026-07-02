import { getDashboardStats } from "@/lib/dashboard";
import { rwf } from "@/lib/utils";
import { StatCard } from "@/components/stat-card";
import { FinanceCharts } from "@/components/finance-charts";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();
  const monthNet = Number(stats.monthIncome) - Number(stats.monthExpenses);
  return (
    <div className="grid gap-6">
      <section className="responsive-grid">
        <StatCard label="Today's income" value={rwf(stats.todayIncome.toString())} />
        <StatCard label="Today's expenses" value={rwf(stats.todayExpenses.toString())} />
        <StatCard label="Current month income" value={rwf(stats.monthIncome.toString())} />
        <StatCard label="Current month expenses" value={rwf(stats.monthExpenses.toString())} />
        <StatCard label="Current month net balance" value={rwf(monthNet)} />
        <StatCard label="Event Coverage income" value={rwf(stats.eventCoverageIncome.toString())} />
        <StatCard label="Pending bookings" value={String(stats.pendingBookings)} />
        <StatCard label="Pending transactions" value={String(stats.pendingTransactions)} />
        <StatCard label="Month closing status" value={stats.period?.status ?? "No open period"} />
        <StatCard label="Top earning service" value={stats.topIncome} />
        <StatCard label="Top expense category" value={stats.topExpense} />
      </section>
      <FinanceCharts serviceIncome={stats.serviceIncome} />
    </div>
  );
}
