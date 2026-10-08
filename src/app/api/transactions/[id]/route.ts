import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { AccountType, Prisma } from "@prisma/client";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { isAccountAdminRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { recalculateClosedPeriodBalance } from "@/lib/transaction-balances";

const editSchema = z.object({
  categoryName: z.string().trim().min(1),
  paymentMethod: z.string().trim().min(1),
  amount: z.coerce.number().positive(),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  periodId: z.string().min(1),
  comments: z.string().trim().max(1200).optional(),
  reason: z.string().trim().max(1200).optional()
});

const accountTypeByPaymentMethod: Record<string, AccountType> = {
  Cash: AccountType.CASH,
  "MTN Momo": AccountType.MOMO,
  Bank: AccountType.BANK,
  Cheque: AccountType.CHEQUE,
  Card: AccountType.BANK,
  Other: AccountType.BANK
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !isAccountAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Only an administrator can edit transactions" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Transaction details could not be read" }, { status: 400 });
  }
  const parsed = editSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Enter valid transaction details" }, { status: 400 });

  const { id } = await params;
  const existing = await prisma.transaction.findUnique({ where: { id }, include: { period: true } });
  if (!existing || existing.isOpeningBalance) return NextResponse.json({ error: "Transaction not found or cannot be edited" }, { status: 404 });
  const date = new Date(`${parsed.data.transactionDate}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== parsed.data.transactionDate) {
    return NextResponse.json({ error: "Enter a valid transaction date" }, { status: 400 });
  }
  const period = await prisma.monthlyPeriod.findUnique({ where: { id: parsed.data.periodId } });
  if (!period) return NextResponse.json({ error: "Choose an accounting month" }, { status: 400 });
  if (period.month !== Number(parsed.data.transactionDate.slice(5, 7)) || period.year !== Number(parsed.data.transactionDate.slice(0, 4))) {
    return NextResponse.json({ error: "The date must be in the selected accounting month" }, { status: 400 });
  }
  if ((existing.period.status === "CLOSED" || period.status === "CLOSED") && !parsed.data.reason) {
    return NextResponse.json({ error: "Enter a correction reason when editing a closed month" }, { status: 400 });
  }

  const accountType = accountTypeByPaymentMethod[parsed.data.paymentMethod];
  if (!accountType) return NextResponse.json({ error: "Choose a valid payment method" }, { status: 400 });
  const [category, account] = await Promise.all([
    prisma.category.findFirst({ where: { name: parsed.data.categoryName, type: existing.type, active: true } }),
    prisma.account.findFirst({ where: { type: accountType, active: true } })
  ]);
  if (!category || !account) return NextResponse.json({ error: "Choose a valid category and payment method" }, { status: 400 });

  try {
    const transaction = await prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id },
        data: {
          periodId: period.id,
          categoryId: category.id,
          accountId: account.id,
          paymentMethod: parsed.data.paymentMethod,
          amount: new Prisma.Decimal(parsed.data.amount),
          transactionDate: date,
          transactionTime: "00:00",
          description: null,
          comments: parsed.data.comments || null
        }
      });
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "Transaction updated",
          entityType: "Transaction",
          entityId: id,
          oldValue: {
            periodId: existing.periodId,
            amount: existing.amount.toString(),
            transactionDate: existing.transactionDate.toISOString().slice(0, 10),
            categoryId: existing.categoryId,
            accountId: existing.accountId,
            comments: existing.comments
          },
          newValue: {
            periodId: updated.periodId,
            amount: updated.amount.toString(),
            transactionDate: updated.transactionDate.toISOString().slice(0, 10),
            categoryId: updated.categoryId,
            accountId: updated.accountId,
            comments: updated.comments
          },
          reason: parsed.data.reason || undefined
        }
      });
      for (const periodId of new Set([existing.periodId, period.id])) {
        await recalculateClosedPeriodBalance(tx, periodId);
      }
      return updated;
    });
    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Transaction update failed", error);
    return NextResponse.json({ error: "The transaction could not be updated" }, { status: 500 });
  }
}
