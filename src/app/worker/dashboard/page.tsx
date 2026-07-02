import { getDashboardStats } from "@/lib/dashboard";
import { StatCard } from "@/components/stat-card";

export const dynamic = "force-dynamic";

export default async function WorkerDashboardPage() {
  const stats = await getDashboardStats();
  return <div className="responsive-grid"><StatCard label="Today's assigned bookings" value={String(stats.pendingBookings)} /><StatCard label="Pending reports" value="0" /><StatCard label="Pending transactions" value={String(stats.pendingTransactions)} /></div>;
}
