import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSection } from "@/lib/server-permissions";
import { monthLabel, rwf } from "@/lib/utils";

export const dynamic = "force-dynamic";

const denominations = [100, 500, 1000, 2000, 5000, 10000];

async function saveCashCount(formData: FormData) {
  "use server";
  const session = await requireAdminSection("/admin/cash-count");
  const periodId = String(formData.get("periodId") ?? "");
  if (!periodId) throw new Error("No open period was selected");

  const entries = denominations.map((denomination) => {
    const quantity = Number(formData.get(`denomination-${denomination}`) ?? 0);
    if (!Number.isInteger(quantity) || quantity < 0) throw new Error("Cash quantities must be whole numbers of zero or more");
    return { denomination, quantity, total: denomination * quantity };
  });

  await prisma.$transaction(async (tx) => {
    const period = await tx.monthlyPeriod.findUnique({ where: { id: periodId } });
    if (!period || period.status === "CLOSED") throw new Error("Cash count cannot be saved for a closed or missing month");

    for (const entry of entries) {
      const existing = await tx.cashCount.findFirst({ where: { periodId, denomination: entry.denomination }, orderBy: { id: "asc" } });
      if (existing) {
        await tx.cashCount.update({ where: { id: existing.id }, data: { quantity: entry.quantity, total: entry.total } });
      } else {
        await tx.cashCount.create({ data: { periodId, ...entry } });
      }
    }

    await tx.auditLog.create({
      data: { userId: session.user.id, action: "Cash count saved", entityType: "MonthlyPeriod", entityId: periodId, newValue: { entries } }
    });
  });
  revalidatePath("/admin/cash-count");
}

export default async function CashCountPage() {
  const period = await prisma.monthlyPeriod.findFirst({
    where: { status: { in: ["OPEN", "UNDER_REVIEW"] } },
    include: { cashCounts: true },
    orderBy: [{ year: "desc" }, { month: "desc" }]
  });
  const total = period?.cashCounts.reduce((sum, item) => sum + Number(item.total), 0) ?? 0;

  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-black">Cash Count</h2>
      {!period && <p className="card p-5">No open period found.</p>}
      {period && (
        <form action={saveCashCount} className="card grid gap-4 p-5">
          <input type="hidden" name="periodId" value={period.id} />
          <div>
            <h3 className="font-black">{monthLabel(period.month, period.year)}</h3>
            <p className="text-sm text-[var(--muted)]">Saved cash total: {rwf(total)}</p>
          </div>
          {denominations.map((denomination) => {
            const saved = period.cashCounts.find((item) => item.denomination === denomination);
            return (
              <label className="grid gap-1 md:grid-cols-[160px_1fr] md:items-center" key={denomination}>
                <strong>{denomination} RWF</strong>
                <input className="input" name={`denomination-${denomination}`} type="number" min="0" step="1" defaultValue={saved?.quantity ?? 0} placeholder="Quantity" required />
              </label>
            );
          })}
          <button className="btn btn-primary w-fit" type="submit">Save Cash Count</button>
        </form>
      )}
    </div>
  );
}
