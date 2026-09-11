import { Prisma, TransactionType } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const confirmed = { status: "CONFIRMED" as const };
  const period = await prisma.monthlyPeriod.findFirst({
    where: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
    orderBy: [{ year: "desc" }, { month: "desc" }]
  });
  const currentPeriod = { periodId: period?.id ?? "" };
  const operatingIncome = { ...confirmed, ...currentPeriod, type: TransactionType.INCOME, isOpeningBalance: false };

  const [todayIncome, todayExpenses, monthIncome, monthExpenses, monthAdjustments, eventCoverageIncome, pendingBookings, pendingTransactions] = await Promise.all([
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { ...operatingIncome, transactionDate: { gte: todayStart } } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { ...confirmed, ...currentPeriod, type: TransactionType.EXPENSE, transactionDate: { gte: todayStart } } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: operatingIncome }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { ...confirmed, ...currentPeriod, type: TransactionType.EXPENSE } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { ...confirmed, ...currentPeriod, type: TransactionType.ADJUSTMENT } }),
    prisma.transaction.aggregate({ _sum: { amount: true }, where: { ...operatingIncome, service: { name: "Event Coverage" } } }),
    prisma.booking.count({ where: { bookingStatus: "PENDING" } }),
    prisma.transaction.count({ where: { ...currentPeriod, status: "PENDING" } })
  ]);

  const [topIncome, topExpense, serviceIncomeRows] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: operatingIncome,
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 1
    }),
    prisma.transaction.groupBy({
      by: ["categoryId"],
      where: { ...confirmed, ...currentPeriod, type: TransactionType.EXPENSE },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 1
    }),
    prisma.transaction.groupBy({
      by: ["serviceId"],
      where: { ...operatingIncome, serviceId: { not: null } },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 8
    })
  ]);

  const serviceIds = serviceIncomeRows.map((row) => row.serviceId).filter(Boolean) as string[];
  const categoryIds = [topIncome[0]?.categoryId, topExpense[0]?.categoryId].filter(Boolean) as string[];
  const [services, categories] = await Promise.all([
    prisma.service.findMany({ where: { id: { in: serviceIds } } }),
    prisma.category.findMany({ where: { id: { in: categoryIds } } })
  ]);
  const serviceName = (id: string | null) => services.find((service) => service.id === id)?.name ?? "Unassigned";
  const categoryName = (id?: string) => categories.find((category) => category.id === id)?.name ?? "No records yet";

  return {
    todayIncome: todayIncome._sum.amount ?? new Prisma.Decimal(0),
    todayExpenses: todayExpenses._sum.amount ?? new Prisma.Decimal(0),
    monthIncome: monthIncome._sum.amount ?? new Prisma.Decimal(0),
    monthExpenses: monthExpenses._sum.amount ?? new Prisma.Decimal(0),
    monthAdjustments: monthAdjustments._sum.amount ?? new Prisma.Decimal(0),
    openingBalance: period?.openingBalance ?? new Prisma.Decimal(0),
    eventCoverageIncome: eventCoverageIncome._sum.amount ?? new Prisma.Decimal(0),
    pendingBookings,
    pendingTransactions,
    period,
    topIncome: serviceIncomeRows[0] ? serviceName(serviceIncomeRows[0].serviceId) : categoryName(topIncome[0]?.categoryId),
    topExpense: categoryName(topExpense[0]?.categoryId),
    serviceIncome: serviceIncomeRows.map((row) => ({ name: serviceName(row.serviceId), value: Number(row._sum.amount ?? 0) }))
  };
}
