import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { AccountType, Prisma, TransactionType } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { isAccountAdminRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { monthClosingSchema } from "@/lib/validations";
import { sendMonthClosedNotification } from "@/lib/month-closing-notifications";

const accountBalanceFields = [
  { key: "cash", accountType: AccountType.CASH, label: "Cash" },
  { key: "momo", accountType: AccountType.MOMO, label: "MoMo" },
  { key: "bank", accountType: AccountType.BANK, label: "Bank" },
  { key: "cheque", accountType: AccountType.CHEQUE, label: "Cheque" },
  { key: "other", accountType: AccountType.OTHER, label: "Other" }
] as const;

class MonthClosingError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !isAccountAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Month-closing details could not be read" }, { status: 400 });
  }

  const parsed = monthClosingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter valid, non-negative closing balances for every account" }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const period = await tx.monthlyPeriod.findUnique({
        where: { id: parsed.data.periodId },
        include: {
          transactions: {
            select: { type: true, status: true, amount: true, isOpeningBalance: true }
          }
        }
      });

      if (!period) throw new MonthClosingError("The accounting month could not be found", 404);
      if (period.status === "CLOSED") throw new MonthClosingError("This accounting month has already been closed", 409);

      const pending = period.transactions.filter((transaction) => transaction.status === "PENDING").length;
      if (pending > 0) throw new MonthClosingError("Cannot close month because pending records exist");

      const confirmedTransactions = period.transactions.filter((transaction) => transaction.status === "CONFIRMED");
      const operatingIncome = confirmedTransactions
        .filter((transaction) => transaction.type === TransactionType.INCOME && !transaction.isOpeningBalance)
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
      const expenses = confirmedTransactions
        .filter((transaction) => transaction.type === TransactionType.EXPENSE)
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
      const adjustments = confirmedTransactions
        .filter((transaction) => transaction.type === TransactionType.ADJUSTMENT)
        .reduce((sum, transaction) => sum + Number(transaction.amount), 0);
      const expected = roundCurrency(Number(period.openingBalance) + operatingIncome - expenses + adjustments);

      const closingBalances = accountBalanceFields.map((field) => ({
        ...field,
        amount: parsed.data[field.key]
      }));
      const counted = roundCurrency(closingBalances.reduce((sum, balance) => sum + balance.amount, 0));
      const difference = roundCurrency(counted - expected);
      const reason = parsed.data.reason?.trim() || null;

      if (difference !== 0 && !reason) {
        throw new MonthClosingError("Difference found in month closing. Reason is required.");
      }

      const nextStart = new Date(period.year, period.month, 1);
      const nextMonth = nextStart.getMonth() + 1;
      const nextYear = nextStart.getFullYear();
      const nextEnd = new Date(nextYear, nextStart.getMonth() + 1, 0);
      const existingNextPeriod = await tx.monthlyPeriod.findUnique({
        where: { month_year: { month: nextMonth, year: nextYear } },
        include: { transactions: { select: { isOpeningBalance: true } } }
      });

      if (existingNextPeriod?.status === "CLOSED") {
        throw new MonthClosingError("The following accounting month is already closed and cannot be reopened", 409);
      }
      if (existingNextPeriod?.transactions.some((transaction) => !transaction.isOpeningBalance)) {
        throw new MonthClosingError("The following accounting month already has transactions and its opening balance cannot be changed", 409);
      }

      const accounts = await tx.account.findMany({
        where: { type: { in: accountBalanceFields.map((balance) => balance.accountType) } },
        select: { id: true, type: true }
      });
      const accountIdByType = new Map(accounts.map((account) => [account.type, account.id]));
      const missingAccounts = closingBalances.filter((balance) => balance.amount > 0 && !accountIdByType.has(balance.accountType));
      if (missingAccounts.length > 0) {
        throw new MonthClosingError(`Set up account records for ${missingAccounts.map((balance) => balance.label).join(", ")} before closing this month`);
      }

      const openingBalanceCategory = await tx.category.upsert({
        where: { id: "income-opening-balance" },
        update: { name: "Opening Balance", type: TransactionType.INCOME, scope: "BUSINESS" },
        create: { id: "income-opening-balance", name: "Opening Balance", type: TransactionType.INCOME, scope: "BUSINESS" }
      });

      await tx.monthlyPeriod.update({
        where: { id: period.id },
        data: {
          expectedClosingBalance: new Prisma.Decimal(expected),
          countedClosingBalance: new Prisma.Decimal(counted),
          difference: new Prisma.Decimal(difference),
          status: "CLOSED",
          closedById: session.user.id,
          closedAt: new Date(),
          closingDate: new Date(parsed.data.closingDate),
          adminNotes: reason
        }
      });

      await Promise.all(closingBalances.map((balance) => tx.periodAccountBalance.upsert({
        where: { periodId_accountType: { periodId: period.id, accountType: balance.accountType } },
        update: { closingBalance: new Prisma.Decimal(balance.amount) },
        create: { periodId: period.id, accountType: balance.accountType, closingBalance: new Prisma.Decimal(balance.amount) }
      })));

      const nextPeriod = existingNextPeriod
        ? await tx.monthlyPeriod.update({
            where: { id: existingNextPeriod.id },
            data: {
              startDate: nextStart,
              endDate: nextEnd,
              openingBalance: new Prisma.Decimal(counted),
              openingDate: new Date(parsed.data.openingDate),
              status: "OPEN",
              expectedClosingBalance: new Prisma.Decimal(0),
              countedClosingBalance: new Prisma.Decimal(0),
              difference: new Prisma.Decimal(0),
              closedById: null,
              closedAt: null,
              adminNotes: null
            }
          })
        : await tx.monthlyPeriod.create({
            data: {
              month: nextMonth,
              year: nextYear,
              startDate: nextStart,
              endDate: nextEnd,
              openingBalance: new Prisma.Decimal(counted),
              openingDate: new Date(parsed.data.openingDate),
              status: "OPEN"
            }
          });

      if (existingNextPeriod) {
        await tx.transaction.deleteMany({ where: { periodId: nextPeriod.id, isOpeningBalance: true } });
      }

      await Promise.all(closingBalances.map((balance) => tx.periodAccountBalance.upsert({
        where: { periodId_accountType: { periodId: nextPeriod.id, accountType: balance.accountType } },
        update: { openingBalance: new Prisma.Decimal(balance.amount), closingBalance: new Prisma.Decimal(0) },
        create: { periodId: nextPeriod.id, accountType: balance.accountType, openingBalance: new Prisma.Decimal(balance.amount) }
      })));

      const openingTransactions = closingBalances
        .filter((balance) => balance.amount > 0)
        .map((balance) => ({
          periodId: nextPeriod.id,
          type: TransactionType.INCOME,
          categoryId: openingBalanceCategory.id,
          accountId: accountIdByType.get(balance.accountType)!,
          paymentMethod: "Opening Balance",
          amount: new Prisma.Decimal(balance.amount),
          transactionDate: nextStart,
          transactionTime: "00:00",
          description: null,
          comments: `Opening balance carried forward from ${period.month}/${period.year} — ${balance.label} closing balance from the preceding month`,
          isOpeningBalance: true,
          status: "CONFIRMED" as const,
          recordedById: session.user.id,
          confirmedById: session.user.id,
          confirmedAt: new Date()
        }));
      if (openingTransactions.length > 0) {
        await tx.transaction.createMany({ data: openingTransactions });
      }

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "Month closed and next month opened",
          entityType: "MonthlyPeriod",
          entityId: period.id,
          newValue: {
            expectedClosingBalance: expected,
            countedClosingBalance: counted,
            difference,
            closingBalances: Object.fromEntries(closingBalances.map((balance) => [balance.key, balance.amount])),
            nextPeriod: { id: nextPeriod.id, month: nextPeriod.month, year: nextPeriod.year, openingBalance: counted }
          },
          reason: reason ?? undefined
        }
      });

      return { expected, counted, difference, nextPeriod, closedPeriodId: period.id };
    });

    // Send notification email asynchronously (don't wait for it)
    Promise.resolve()
      .then(async () => {
        const closedPeriod = await prisma.monthlyPeriod.findUnique({ where: { id: result.closedPeriodId } });
        const closedByUser = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (closedPeriod && closedByUser) {
          await sendMonthClosedNotification(closedPeriod, closedByUser, result.nextPeriod);
        }
      })
      .catch((err) => console.error("Failed to send month closed notification:", err));

    return NextResponse.json({
      ok: true,
      expected: result.expected,
      counted: result.counted,
      difference: result.difference,
      nextPeriod: {
        month: result.nextPeriod.month,
        year: result.nextPeriod.year,
        openingBalance: result.counted
      }
    });
  } catch (error) {
    if (error instanceof MonthClosingError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Month closing failed", error);
    return NextResponse.json({ error: "The month could not be closed. Please try again." }, { status: 500 });
  }
}
