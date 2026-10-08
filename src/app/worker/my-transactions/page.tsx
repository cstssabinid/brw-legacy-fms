import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransactionsTable } from "@/components/transactions-table";

export const dynamic = "force-dynamic";

export default async function MyTransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const rows = await prisma.transaction.findMany({
    where: { recordedById: session?.user.id },
    select: {
      id: true,
      periodId: true,
      type: true,
      paymentMethod: true,
      amount: true,
      transactionDate: true,
      comments: true,
      description: true,
      isOpeningBalance: true,
      status: true,
      category: { select: { name: true } },
      service: { select: { name: true } },
      package: { select: { name: true } },
      recordedBy: { select: { name: true } },
      period: { select: { status: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  const transactions = rows.map((transaction) => ({
    ...transaction,
    amount: transaction.amount.toString(),
    transactionDate: transaction.transactionDate.toISOString()
  }));
  return <div className="grid gap-5"><h2 className="text-2xl font-black">My Transactions</h2><TransactionsTable transactions={transactions} /></div>;
}
