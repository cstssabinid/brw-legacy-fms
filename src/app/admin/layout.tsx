import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PortalShell } from "@/components/portal-shell";
import { BerwaBot } from "@/components/berwa-bot";
import { authOptions } from "@/lib/auth";
import { adminNavigationForRole, hasAdminPortalAccess, RESTRICTED_STAFF_ROLE } from "@/lib/permissions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = session?.user.role;
  if (!hasAdminPortalAccess(role)) redirect("/login");

  const restricted = role === RESTRICTED_STAFF_ROLE;
  const nav = adminNavigationForRole(role).map(({ label, href }) => ({ label, href }));

  return (
    <PortalShell nav={nav} title={restricted ? "Staff Portal" : "Admin Portal"}>
      {children}
      <BerwaBot role={restricted ? RESTRICTED_STAFF_ROLE : "ADMIN"} />
    </PortalShell>
  );
}
