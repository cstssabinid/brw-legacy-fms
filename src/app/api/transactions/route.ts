import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validations";
import { recalculateClosedPeriodBalance } from "@/lib/transaction-balances";
import { AccountType } from "@prisma/client";
import { canEnterOperationalData, isAccountAdminRole, isRestrictedStaffRole } from "@/lib/permissions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !canEnterOperationalData(session.user.role)) return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  const isWorker = session.user.role === "WORKER" || isRestrictedStaffRole(session.user.role);
  const transactions = await prisma.transaction.findMany({
    where: isWorker ? { recordedById: session.user.id } : undefined,
    include: { category: true, account: true, service: true, package: true, recordedBy: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return NextResponse.json({ transactions });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !canEnterOperationalData(session.user.role)) return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  const body = await request.json();
  const parsed = transactionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Missing required field", issues: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.amount < 0 && !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
    return NextResponse.json({ error: "Negative amounts are admin-only adjustments" }, { status: 400 });
  }

  const date = new Date(`${parsed.data.transactionDate}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== parsed.data.transactionDate) {
    return NextResponse.json({ error: "Enter a valid transaction date" }, { status: 400 });
  }
  if (parsed.data.periodId && !isAccountAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Only an administrator can select an accounting month" }, { status: 403 });
  }
  const period = parsed.data.periodId
    ? await prisma.monthlyPeriod.findUnique({ where: { id: parsed.data.periodId } })
    : await prisma.monthlyPeriod.findFirst({ where: { month: Number(parsed.data.transactionDate.slice(5, 7)), year: Number(parsed.data.transactionDate.slice(0, 4)) } });
  if (!period) return NextResponse.json({ error: "Choose an accounting month" }, { status: 400 });
  if (period.month !== Number(parsed.data.transactionDate.slice(5, 7)) || period.year !== Number(parsed.data.transactionDate.slice(0, 4))) {
    return NextResponse.json({ error: "The date must be in the selected accounting month" }, { status: 400 });
  }
  if (period.status === "CLOSED" && !isAccountAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Only an administrator can correct a closed month" }, { status: 403 });
  }
  if (period.status === "CLOSED" && !parsed.data.reason?.trim()) {
    return NextResponse.json({ error: "Enter a correction reason for the closed month" }, { status: 400 });
  }

  const category = await prisma.category.findFirst({ where: { name: parsed.data.categoryName, type: parsed.data.type } });
  const accountTypeByPaymentMethod: Record<string, AccountType> = {
    Cash: AccountType.CASH,
    "MTN Momo": AccountType.MOMO,
    Bank: AccountType.BANK,
    Cheque: AccountType.CHEQUE,
    Card: AccountType.BANK,
    Other: AccountType.BANK
  };
  const accountType = accountTypeByPaymentMethod[parsed.data.paymentMethod];
  const account = accountType ? await prisma.account.findFirst({ where: { type: accountType } }) : null;
  const service = parsed.data.serviceName ? await prisma.service.findFirst({ where: { name: parsed.data.serviceName } }) : null;
  const selectedPackage = parsed.data.packageName ? await prisma.package.findFirst({ where: { name: parsed.data.packageName, serviceId: service?.id } }) : null;
  if (!category || !account) return NextResponse.json({ error: "Invalid category or payment method" }, { status: 400 });

  const transaction = await prisma.$transaction(async (tx) => {
    const created = await tx.transaction.create({
      data: {
        periodId: period.id,
        type: parsed.data.type,
        categoryId: category.id,
        serviceId: service?.id,
        packageId: selectedPackage?.id,
        accountId: account.id,
        paymentMethod: parsed.data.paymentMethod,
        amount: parsed.data.amount,
        transactionDate: date,
        transactionTime: "00:00",
        description: null,
        comments: parsed.data.comments,
        recordedById: session.user.id,
        status: isAccountAdminRole(session.user.role) ? "CONFIRMED" : "PENDING",
        confirmedById: isAccountAdminRole(session.user.role) ? session.user.id : undefined,
        confirmedAt: isAccountAdminRole(session.user.role) ? new Date() : undefined
      }
    });
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "Transaction created",
        entityType: "Transaction",
        entityId: created.id,
        newValue: created,
        reason: parsed.data.reason || undefined
      }
    });
    if (period.status === "CLOSED") await recalculateClosedPeriodBalance(tx, period.id);
    return created;
  });
  return NextResponse.json({ ok: true, transaction });
}
