import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal-shell";
import { BerwaBot } from "@/components/berwa-bot";
import { authOptions } from "@/lib/auth";
import { adminNavigationForRole, hasAdminPortalAccess, isRestrictedStaffRole } from "@/lib/permissions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = session?.user.role;
  if (!hasAdminPortalAccess(role)) redirect("/login");

  const restricted = isRestrictedStaffRole(role);
  const nav = adminNavigationForRole(role).map(({ label, href }) => ({ label, href }));

  return (
    <PortalShell nav={nav} title={restricted ? "Cashier Portal" : "Admin Portal"}>
      {children}
      <BerwaBot role={restricted ? "CASHIER" : "ADMIN"} />
    </PortalShell>
  );
}
