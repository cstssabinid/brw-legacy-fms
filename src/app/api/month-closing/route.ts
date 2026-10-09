import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { AccountType, Prisma, TransactionType } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { isAccountAdminRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { monthClosingSchema } from "@/lib/validations";
import { recalculateClosedPeriodBalance } from "@/lib/transaction-balances";
import { sendMonthClosedNotification } from "@/lib/month-closing-notifications";

const accountBalanceFields = [
  { key: "cash", accountType: AccountType.CASH, label: "Cash" },
  { key: "momo", accountType: AccountType.MOMO, label: "MoMo" },
  { key: "bank", accountType: AccountType.BANK, label: "Bank" },
  { key: "cheque", accountType: AccountType.CHEQUE, label: "Cheque" },
  { key: "other", accountType: AccountType.OTHER, label: "Other" }
] as const;

type ClosingBalance = (typeof accountBalanceFields)[number] & { amount: number };

class MonthClosingError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

function roundCurrency(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function totalBalances(balances: ClosingBalance[]) {
  return roundCurrency(balances.reduce((sum, balance) => sum + balance.amount, 0));
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
      const isReclosing = period.status === "CLOSED";
      if (isReclosing && !parsed.data.reason?.trim()) {
        throw new MonthClosingError("Enter a reason before reclosing this month");
      }

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

      const closingBalances: ClosingBalance[] = accountBalanceFields.map((field) => ({
        ...field,
        amount: parsed.data[field.key]
      }));
      const counted = totalBalances(closingBalances);
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
        where: { month_year: { month: nextMonth, year: nextYear } }
      });

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
        ? existingNextPeriod
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

      const laterPeriods = await tx.monthlyPeriod.findMany({
        where: {
          OR: [
            { year: { gt: period.year } },
            { year: period.year, month: { gt: period.month } }
          ]
        },
        include: { accountBalances: { select: { accountType: true, closingBalance: true } } },
        orderBy: [{ year: "asc" }, { month: "asc" }]
      });

      let carriedBalances = closingBalances;
      const updatedPeriods: Array<{ id: string; month: number; year: number; openingBalance: number }> = [];
      for (const laterPeriod of laterPeriods) {
        const openingBalance = totalBalances(carriedBalances);
        const isImmediateNext = laterPeriod.id === nextPeriod.id;
        const openingDate = isImmediateNext
          ? new Date(parsed.data.openingDate)
          : laterPeriod.openingDate ?? laterPeriod.startDate;

        await tx.monthlyPeriod.update({
          where: { id: laterPeriod.id },
          data: { openingBalance: new Prisma.Decimal(openingBalance), openingDate }
        });
        await Promise.all(carriedBalances.map((balance) => tx.periodAccountBalance.upsert({
          where: { periodId_accountType: { periodId: laterPeriod.id, accountType: balance.accountType } },
          update: { openingBalance: new Prisma.Decimal(balance.amount) },
          create: {
            periodId: laterPeriod.id,
            accountType: balance.accountType,
            openingBalance: new Prisma.Decimal(balance.amount)
          }
        })));

        await tx.transaction.deleteMany({ where: { periodId: laterPeriod.id, isOpeningBalance: true } });
        const openingTransactions = carriedBalances
          .filter((balance) => balance.amount > 0)
          .map((balance) => {
            const accountId = accountIdByType.get(balance.accountType);
            if (!accountId) throw new MonthClosingError(`Set up an account record for ${balance.label} before updating the opening balance`);
            return {
              periodId: laterPeriod.id,
              type: TransactionType.INCOME,
              categoryId: openingBalanceCategory.id,
              accountId,
              paymentMethod: "Opening Balance",
              amount: new Prisma.Decimal(balance.amount),
              transactionDate: laterPeriod.startDate,
              transactionTime: "00:00",
              description: null,
              comments: `Opening balance carried forward from ${laterPeriod.month === 1 ? laterPeriod.year - 1 : laterPeriod.year}/${laterPeriod.month === 1 ? 12 : laterPeriod.month - 1} — ${balance.label} closing balance from the preceding month`,
              isOpeningBalance: true,
              status: "CONFIRMED" as const,
              recordedById: session.user.id,
              confirmedById: session.user.id,
              confirmedAt: new Date()
            };
          });
        if (openingTransactions.length > 0) await tx.transaction.createMany({ data: openingTransactions });

        if (laterPeriod.status === "CLOSED") {
          await recalculateClosedPeriodBalance(tx, laterPeriod.id);
          const closingBalanceByType = new Map<AccountType, number>(
            laterPeriod.accountBalances.map((item): [AccountType, number] => [item.accountType, Number(item.closingBalance)])
          );
          carriedBalances = accountBalanceFields.map((field) => ({
            ...field,
            amount: closingBalanceByType.get(field.accountType) ?? 0
          }));
        } else {
          // Preserve the current month's entries and stop once the live period is updated.
          const livePeriod = laterPeriods.find((item) => item.status !== "CLOSED");
          if (livePeriod?.id === laterPeriod.id) {
            updatedPeriods.push({ id: laterPeriod.id, month: laterPeriod.month, year: laterPeriod.year, openingBalance });
            break;
          }
        }

        updatedPeriods.push({ id: laterPeriod.id, month: laterPeriod.month, year: laterPeriod.year, openingBalance });
      }

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: isReclosing ? "Month reclosed and following balances updated" : "Month closed and next month opened",
          entityType: "MonthlyPeriod",
          entityId: period.id,
          newValue: {
            expectedClosingBalance: expected,
            countedClosingBalance: counted,
            difference,
            closingBalances: Object.fromEntries(closingBalances.map((balance) => [balance.key, balance.amount])),
            updatedPeriods
          },
          reason: reason ?? undefined
        }
      });

      const refreshedNextPeriod = await tx.monthlyPeriod.findUniqueOrThrow({ where: { id: nextPeriod.id } });
      return { expected, counted, difference, nextPeriod: refreshedNextPeriod, updatedPeriods, closedPeriodId: period.id, isReclosing };
    });

    if (!result.isReclosing) {
      // Send the first-close notification asynchronously; corrections should not resend the close email.
      Promise.resolve()
        .then(async () => {
          const closedPeriod = await prisma.monthlyPeriod.findUnique({ where: { id: result.closedPeriodId } });
          const closedByUser = await prisma.user.findUnique({ where: { id: session.user.id } });
          if (closedPeriod && closedByUser) {
            await sendMonthClosedNotification(closedPeriod, closedByUser, result.nextPeriod);
          }
        })
        .catch((err) => console.error("Failed to send month closed notification:", err));
    }

    return NextResponse.json({
      ok: true,
      expected: result.expected,
      counted: result.counted,
      difference: result.difference,
      updatedPeriods: result.updatedPeriods,
      nextPeriod: {
        month: result.nextPeriod.month,
        year: result.nextPeriod.year,
        openingBalance: Number(result.nextPeriod.openingBalance)
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
