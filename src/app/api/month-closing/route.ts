import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Prisma, TransactionType } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  const body = await request.json();
  const periodId = String(body.periodId);
  const pending = await prisma.transaction.count({ where: { periodId, status: "PENDING" } });
  if (pending > 0) return NextResponse.json({ error: "Cannot close month because pending records exist" }, { status: 400 });
  const period = await prisma.monthlyPeriod.findUniqueOrThrow({ where: { id: periodId }, include: { transactions: true } });
  const income = period.transactions.filter((tx) => tx.type === TransactionType.INCOME && tx.status === "CONFIRMED").reduce((sum, tx) => sum + Number(tx.amount), 0);
  const expenses = period.transactions.filter((tx) => tx.type === TransactionType.EXPENSE && tx.status === "CONFIRMED").reduce((sum, tx) => sum + Number(tx.amount), 0);
  const adjustments = period.transactions.filter((tx) => tx.type === TransactionType.ADJUSTMENT && tx.status === "CONFIRMED").reduce((sum, tx) => sum + Number(tx.amount), 0);
  const expected = Number(period.openingBalance) + income - expenses + adjustments;
  const counted = ["cash", "momo", "bank", "cheque", "other"].reduce((sum, key) => sum + Number(body[key] ?? 0), 0);
  const difference = counted - expected;
  if (difference !== 0 && !String(body.reason ?? "").trim()) return NextResponse.json({ error: "Difference found in month closing. Reason is required." }, { status: 400 });

  await prisma.monthlyPeriod.update({
    where: { id: periodId },
    data: { expectedClosingBalance: expected, countedClosingBalance: counted, difference, status: "CLOSED", closedById: session.user.id, closedAt: new Date(), adminNotes: body.reason }
  });
  await prisma.auditLog.create({ data: { userId: session.user.id, action: "Month closed", entityType: "MonthlyPeriod", entityId: periodId, newValue: { expected, counted, difference } } });

  const nextStart = new Date(period.year, period.month, 1);
  await prisma.monthlyPeriod.upsert({
    where: { month_year: { month: nextStart.getMonth() + 1, year: nextStart.getFullYear() } },
    update: {},
    create: { month: nextStart.getMonth() + 1, year: nextStart.getFullYear(), startDate: nextStart, endDate: new Date(nextStart.getFullYear(), nextStart.getMonth() + 1, 0), openingBalance: new Prisma.Decimal(counted), status: "OPEN" }
  });

  return NextResponse.json({ ok: true, expected, counted, difference });
}
