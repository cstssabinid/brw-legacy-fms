import { TransactionForm } from "@/components/transaction-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAccountAdminRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminExpensesPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = isAccountAdminRole(session?.user.role);
  const periods = isAdmin ? await prisma.monthlyPeriod.findMany({ orderBy: [{ year: "desc" }, { month: "desc" }], select: { id: true, month: true, year: true, status: true } }) : undefined;
  return <div className="grid gap-5"><h2 className="text-2xl font-black">Add Expense</h2>{isAdmin && periods?.length === 0 ? <p className="card p-5">No accounting months have been created yet.</p> : <TransactionForm type="EXPENSE" periods={periods} />}</div>;
}
