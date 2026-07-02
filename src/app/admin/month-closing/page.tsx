import { MonthClosingForm } from "@/components/month-closing-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MonthClosingPage() {
  const period = await prisma.monthlyPeriod.findFirst({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } }, orderBy: [{ year: "desc" }, { month: "desc" }] });
  return <div className="grid gap-5"><h2 className="text-2xl font-black">Month Closing</h2>{period ? <MonthClosingForm periodId={period.id} /> : <p className="card p-5">No open period found.</p>}</div>;
}
