import { TransactionForm } from "@/components/transaction-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getActiveCatalogPackages, getActiveServices } from "@/lib/catalog";
import { isAccountAdminRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminIncomePage() {
  const [services, packages, session] = await Promise.all([getActiveServices(), getActiveCatalogPackages(), getServerSession(authOptions)]);
  const isAdmin = isAccountAdminRole(session?.user.role);
  const periods = isAdmin ? await prisma.monthlyPeriod.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }], select: { id: true, month: true, year: true, status: true } }) : undefined;
  return <div className="grid gap-5"><h2 className="text-2xl font-black">Add Income</h2>{isAdmin && periods?.length === 0 ? <p className="card p-5">No accounting months have been created yet.</p> : <TransactionForm type="INCOME" services={services} packages={packages} periods={periods} />}</div>;
}
