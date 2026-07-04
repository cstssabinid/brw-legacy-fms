import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { TransactionType } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookingPaymentSchema } from "@/lib/validations";

const incomeCategoryByService = [
  { key: "studio", category: "Studio service earnings" },
  { key: "indoor", category: "Indoor package earnings" },
  { key: "outdoor", category: "Outdoor package earnings" },
  { key: "wedding", category: "Wedding package earnings" },
  { key: "event", category: "Event Coverage earnings" },
  { key: "design", category: "Graphic design earnings" },
  { key: "printing", category: "Printing earnings" },
  { key: "papeterie", category: "Papeterie earnings" },
  { key: "online", category: "Online services earnings" },
  { key: "irembo", category: "Irembo/RURA/RDB service earnings" },
  { key: "rura", category: "Irembo/RURA/RDB service earnings" },
  { key: "rdb", category: "Irembo/RURA/RDB service earnings" },
  { key: "freelancing", category: "Freelancing earnings" }
];

function categoryNameForService(serviceName: string) {
  const normalized = serviceName.toLowerCase();
  return incomeCategoryByService.find((item) => normalized.includes(item.key))?.category ?? "Studio service earnings";
}

function accountNameForMethod(method: string) {
  const normalized = method.toLowerCase();
  if (normalized.includes("momo") || normalized.includes("mtn")) return "MTN MoMo";
  if (normalized.includes("bank")) return "Bank";
  if (normalized.includes("cheque") || normalized.includes("check")) return "Cheque";
  return "Cash at Hand";
}

function paymentStatus(total: number, paid: number) {
  if (paid <= 0) return "PAYMENT_NOT_CONFIRMED";
  if (paid >= total && total > 0) return "FULLY_PAID";
  return paid < total / 2 ? "DEPOSIT_CONFIRMED" : "PARTIALLY_PAID";
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });

  const body = await request.json();
  const parsed = bookingPaymentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Missing required payment field", issues: parsed.error.flatten() }, { status: 400 });
  const { id } = await params;

  try {
  const result = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id }, include: { client: true, service: true, package: true, payments: { where: { status: "CONFIRMED" } } } });
    if (!booking) throw new Error("Booking not found");
    const totalAmount = Number(booking.totalAmount ?? 0);
    if (totalAmount > 0) {
      const alreadyPaid = booking.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
      if (alreadyPaid + parsed.data.amount > totalAmount) throw new Error("Payment exceeds the remaining booking balance");
    }

    const now = new Date();
    const period = await tx.monthlyPeriod.findFirst({ where: { month: now.getMonth() + 1, year: now.getFullYear() } });
    if (!period || period.status === "CLOSED") throw new Error("Cannot record payment in a closed or missing month");

    const category = await tx.category.findFirst({ where: { name: categoryNameForService(booking.service.name), type: TransactionType.INCOME } });
    const account = await tx.account.findFirst({ where: { name: accountNameForMethod(parsed.data.paymentMethod) } });
    if (!category || !account) throw new Error("Income category or account is missing");

    const transaction = await tx.transaction.create({
      data: {
        periodId: period.id,
        type: "INCOME",
        categoryId: category.id,
        serviceId: booking.serviceId,
        packageId: booking.packageId,
        bookingId: booking.id,
        clientId: booking.clientId,
        accountId: account.id,
        paymentMethod: parsed.data.paymentMethod,
        amount: parsed.data.amount,
        transactionDate: now,
        transactionTime: now.toTimeString().slice(0, 5),
        description: `Booking payment confirmation for ${booking.bookingReference}`,
        comments: parsed.data.notes,
        attachmentUrl: parsed.data.proofAttachmentUrl || undefined,
        status: "CONFIRMED",
        recordedById: session.user.id,
        confirmedById: session.user.id,
        confirmedAt: now
      }
    });

    const payment = await tx.bookingPayment.create({
      data: {
        bookingId: booking.id,
        amount: parsed.data.amount,
        paymentMethod: parsed.data.paymentMethod,
        paymentReference: parsed.data.paymentReference || undefined,
        proofReceivedThrough: parsed.data.proofReceivedThrough,
        proofAttachmentUrl: parsed.data.proofAttachmentUrl || undefined,
        notes: parsed.data.notes || undefined,
        status: "CONFIRMED",
        confirmedById: session.user.id,
        confirmedAt: now,
        transactionId: transaction.id
      }
    });

    const confirmedPayments = await tx.bookingPayment.aggregate({ _sum: { amount: true }, where: { bookingId: booking.id, status: "CONFIRMED" } });
    const amountPaid = Number(confirmedPayments._sum.amount ?? 0);
    const remainingAmount = Math.max(totalAmount - amountPaid, 0);
    const updatedBooking = await tx.booking.update({
      where: { id: booking.id },
      data: {
        amountPaid,
        remainingAmount,
        paymentStatus: paymentStatus(totalAmount, amountPaid)
      }
    });

    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: amountPaid >= totalAmount && totalAmount > 0 ? "Full payment confirmed" : "Payment status updated",
        entityType: "Booking",
        entityId: booking.id,
        oldValue: { paymentStatus: booking.paymentStatus, amountPaid: booking.amountPaid },
        newValue: { paymentStatus: updatedBooking.paymentStatus, amountPaid, remainingAmount, bookingPaymentId: payment.id, transactionId: transaction.id }
      }
    });

    return { payment, transaction, booking: updatedBooking };
  });

  return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Payment could not be recorded";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
