import { Prisma, TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const confirmed = { status: "CONFIRMED" as const };

  const [todayIncome, todayExpenses, monthIncome, monthExpenses, eventCoverageIncome, pendingBookings, pendingTransactions, accounts, period] = await Promise.all([
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { ...confirmed, type: TransactionType.INCOME, transactionDate: { gte: todayStart } } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { ...confirmed, type: TransactionType.EXPENSE, transactionDate: { gte: todayStart } } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { ...confirmed, type: TransactionType.INCOME, transactionDate: { gte: monthStart } } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { ...confirmed, type: TransactionType.EXPENSE, transactionDate: { gte: monthStart } } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { ...confirmed, type: TransactionType.INCOME, transactionDate: { gte: monthStart }, service: { name: "Event Coverage" } } }),
    prisma.booking.count({ where: { bookingStatus: "PENDING" } }),
    prisma.transaction.count({ where: { status: "PENDING" } }),
    prisma.account.findMany(),
    prisma.monthlyPeriod.findFirst({ where: { month: now.getMonth() + 1, year: now.getFullYear() } })
  ]);

  const topIncome = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { ...confirmed, type: TransactionType.INCOME },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 1
  });

  const topExpense = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: { ...confirmed, type: TransactionType.EXPENSE },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 1
  });

  const serviceIncomeRows = await prisma.transaction.groupBy({
    by: ["serviceId"],
    where: { ...confirmed, type: TransactionType.INCOME, serviceId: { not: null } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 8
  });

  const serviceIds = serviceIncomeRows.map((row) => row.serviceId).filter(Boolean) as string[];
  const services = await prisma.service.findMany({ where: { id: { in: serviceIds } } });
  const serviceName = (id: string | null) => services.find((service) => service.id === id)?.name ?? "Unassigned";

  const categoryIds = [topIncome[0]?.categoryId, topExpense[0]?.categoryId].filter(Boolean) as string[];
  const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
  const categoryName = (id?: string) => categories.find((category) => category.id === id)?.name ?? "No records yet";

  return {
    todayIncome: todayIncome._sum.amount ?? new Prisma.Decimal(0),
    todayExpenses: todayExpenses._sum.amount ?? new Prisma.Decimal(0),
    monthIncome: monthIncome._sum.amount ?? new Prisma.Decimal(0),
    monthExpenses: monthExpenses._sum.amount ?? new Prisma.Decimal(0),
    eventCoverageIncome: eventCoverageIncome._sum.amount ?? new Prisma.Decimal(0),
    pendingBookings,
    pendingTransactions,
    accounts,
    period,
    topIncome: serviceIncomeRows[0] ? serviceName(serviceIncomeRows[0].serviceId) : categoryName(topIncome[0]?.categoryId),
    topExpense: categoryName(topExpense[0]?.categoryId),
    serviceIncome: serviceIncomeRows.map((row) => ({ name: serviceName(row.serviceId), value: Number(row._sum.amount ?? 0) }))
  };
}
