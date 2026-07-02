import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const periodId = searchParams.get("periodId");
  if (!periodId) return NextResponse.json({ error: "Missing periodId" }, { status: 400 });
  const transactions = await prisma.transaction.findMany({ where: { periodId }, include: { category: true, account: true, service: true, package: true } });
  const rows = ["date,type,category,service,package,account,paymentMethod,amount,status,description", ...transactions.map((tx) => [
    tx.transactionDate.toISOString().slice(0, 10), tx.type, tx.category.name, tx.service?.name ?? "", tx.package?.name ?? "", tx.account.name, tx.paymentMethod, tx.amount.toString(), tx.status, JSON.stringify(tx.description ?? "")
  ].join(","))];
  return new NextResponse(rows.join("\n"), { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=monthly-report.csv" } });
}
