import { PortalShell } from "@/components/portal-shell";
import { BerwaBot } from "@/components/berwa-bot";

const nav = [
  ["Dashboard", "/admin/dashboard"], ["Transactions", "/admin/transactions"], ["Income", "/admin/income"],
  ["Expenses", "/admin/expenses"], ["Bookings", "/admin/bookings"], ["Reports", "/admin/monthly-reports"],
  ["Month Closing", "/admin/month-closing"], ["Cash Count", "/admin/cash-count"], ["Loans", "/admin/loans"],
  ["Budget", "/admin/budget"], ["Services", "/admin/services"], ["Packages", "/admin/packages"],
  ["Blog", "/admin/blog"], ["Gallery", "/admin/gallery"], ["Users", "/admin/users"],
  ["Settings", "/admin/settings"], ["Audit Logs", "/admin/audit-logs"], ["Import", "/admin/import"]
].map(([label, href]) => ({ label, href }));

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell nav={nav} title="Admin Portal">
      {children}
      <BerwaBot role="ADMIN" />
    </PortalShell>
  );
}
