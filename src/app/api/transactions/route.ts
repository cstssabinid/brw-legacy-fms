import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { transactionSchema } from "@/lib/validations";
import { AccountType } from "@prisma/client";
import { canEnterOperationalData } from "@/lib/permissions";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !canEnterOperationalData(session.user.role)) return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  const isWorker = ["WORKER", "CASHIER"].includes(session.user.role);
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

  const date = new Date(parsed.data.transactionDate);
  const period = await prisma.monthlyPeriod.findFirst({ where: { month: date.getMonth() + 1, year: date.getFullYear() } });
  if (!period || period.status === "CLOSED") return NextResponse.json({ error: "Cannot edit a closed or missing month" }, { status: 400 });

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

  const transaction = await prisma.transaction.create({
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
      transactionTime: parsed.data.transactionTime,
      description: parsed.data.description,
      comments: parsed.data.comments,
      recordedById: session.user.id,
      status: ["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(session.user.role) ? "CONFIRMED" : "PENDING",
      confirmedById: ["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(session.user.role) ? session.user.id : undefined,
      confirmedAt: ["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(session.user.role) ? new Date() : undefined
    }
  });

  await prisma.auditLog.create({ data: { userId: session.user.id, action: "Transaction created", entityType: "Transaction", entityId: transaction.id, newValue: transaction } });
  return NextResponse.json({ ok: true, transaction });
}
