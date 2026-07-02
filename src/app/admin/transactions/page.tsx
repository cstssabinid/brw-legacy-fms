import { prisma } from "@/lib/prisma";
import { TransactionsTable } from "@/components/transactions-table";

export const dynamic = "force-dynamic";

export default async function AdminTransactionsPage() {
  const transactions = await prisma.transaction.findMany({ include: { category: true, account: true, service: true, package: true, recordedBy: true }, orderBy: { createdAt: "desc" }, take: 100 });
  return <div className="grid gap-5"><h2 className="text-2xl font-black">Transactions</h2><TransactionsTable transactions={transactions} /></div>;
}
