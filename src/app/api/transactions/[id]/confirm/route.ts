import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !["ADMIN", "SUPER_ADMIN", "MANAGER"].includes(session.user.role)) return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  const { id } = await params;
  const transaction = await prisma.transaction.update({ where: { id }, data: { status: "CONFIRMED", confirmedById: session.user.id, confirmedAt: new Date() } });
  await prisma.auditLog.create({ data: { userId: session.user.id, action: "Transaction confirmed", entityType: "Transaction", entityId: id, newValue: transaction } });
  return NextResponse.json({ ok: true });
}
