import { PortalShell } from "@/components/portal-shell";
import { BerwaBot } from "@/components/berwa-bot";

const nav = [
  ["Dashboard", "/worker/dashboard"], ["Bookings", "/worker/bookings"], ["Add Income", "/worker/add-income"],
  ["Add Expense", "/worker/add-expense"], ["My Transactions", "/worker/my-transactions"], ["Reports", "/worker/reports"],
  ["Help", "/worker/help"]
].map(([label, href]) => ({ label, href }));

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell nav={nav} title="Worker Portal">
      {children}
      <BerwaBot role="WORKER" />
    </PortalShell>
  );
}
