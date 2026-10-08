import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessAdminPath } from "@/lib/permissions";

function csvCell(value: unknown) {
  const stringValue = String(value ?? "");
  return `"${stringValue.replaceAll("\"", "\"\"")}"`;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !canAccessAdminPath(session.user.role, "/admin/monthly-reports")) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const periodId = searchParams.get("periodId");
  if (!periodId) return NextResponse.json({ error: "Missing periodId" }, { status: 400 });

  const period = await prisma.monthlyPeriod.findUnique({ where: { id: periodId } });
  if (!period) return NextResponse.json({ error: "Accounting month not found" }, { status: 404 });

  const transactions = await prisma.transaction.findMany({
    where: { periodId },
    include: { category: true, account: true, service: true, package: true },
    orderBy: [{ transactionDate: "asc" }, { createdAt: "asc" }]
  });
  const rows = [
    ["Accounting month", `${period.year}-${String(period.month).padStart(2, "0")}`],
    ["Opening balance", period.openingBalance.toString()],
    ["Expected closing balance", period.expectedClosingBalance.toString()],
    ["Recorded closing balance", period.countedClosingBalance.toString()],
    ["Difference", period.difference.toString()],
    ["Status", period.status],
    [],
    ["date", "entry", "type", "category", "service", "package", "account", "paymentMethod", "amount", "status", "comments"]
  ];
  for (const transaction of transactions) {
    rows.push([
      transaction.transactionDate.toISOString().slice(0, 10),
      transaction.isOpeningBalance ? "Opening balance" : "Operating",
      transaction.type,
      transaction.category.name,
      transaction.service?.name ?? "",
      transaction.package?.name ?? "",
      transaction.account.name,
      transaction.paymentMethod,
      transaction.amount.toString(),
      transaction.status,
      transaction.comments ?? transaction.description ?? ""
    ]);
  }

  const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
  const filename = `monthly-report-${period.year}-${String(period.month).padStart(2, "0")}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=${filename}`
    }
  });
}
