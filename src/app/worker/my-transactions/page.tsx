import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransactionsTable } from "@/components/transactions-table";

export const dynamic = "force-dynamic";

export default async function MyTransactionsPage() {
  const session = await getServerSession(authOptions);
  const transactions = await prisma.transaction.findMany({ where: { recordedById: session?.user.id }, include: { category: true, account: true, service: true, package: true, recordedBy: true }, orderBy: { createdAt: "desc" } });
  return <div className="grid gap-5"><h2 className="text-2xl font-black">My Transactions</h2><TransactionsTable transactions={transactions} /></div>;
}
