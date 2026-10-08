import { Prisma, TransactionType } from "@prisma/client";

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function recalculateClosedPeriodBalance(tx: Prisma.TransactionClient, periodId: string) {
  const period = await tx.monthlyPeriod.findUnique({
    where: { id: periodId },
    include: { transactions: { select: { type: true, status: true, amount: true, isOpeningBalance: true } } }
  });
  if (!period || period.status !== "CLOSED") return;

  const confirmed = period.transactions.filter((transaction) => transaction.status === "CONFIRMED");
  const income = confirmed
    .filter((transaction) => transaction.type === TransactionType.INCOME && !transaction.isOpeningBalance)
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const expenses = confirmed
    .filter((transaction) => transaction.type === TransactionType.EXPENSE)
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const adjustments = confirmed
    .filter((transaction) => transaction.type === TransactionType.ADJUSTMENT)
    .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
  const expected = roundCurrency(Number(period.openingBalance) + income - expenses + adjustments);
  const difference = roundCurrency(Number(period.countedClosingBalance) - expected);
  await tx.monthlyPeriod.update({
    where: { id: period.id },
    data: { expectedClosingBalance: new Prisma.Decimal(expected), difference: new Prisma.Decimal(difference) }
  });
}
