import { getServerSession } from "next-auth";
import { MonthClosingForm } from "@/components/month-closing-form";
import { authOptions } from "@/lib/auth";
import { isAccountAdminRole } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { monthLabel, rwf } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MonthClosingPage() {
  const [session, period] = await Promise.all([
    getServerSession(authOptions),
    prisma.monthlyPeriod.findFirst({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } }, orderBy: [{ year: "desc" }, { month: "desc" }] })
  ]);
  const canCloseMonth = isAccountAdminRole(session?.user.role);

  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-black">Month Closing</h2>
      {!period && <p className="card p-5">No open period found.</p>}
      {period && canCloseMonth && <MonthClosingForm periodId={period.id} />}
      {period && !canCloseMonth && (
        <div className="card grid gap-2 p-5">
          <h3 className="font-black">{monthLabel(period.month, period.year)}</h3>
          <p>Status: {period.status}</p>
          <p>Opening balance: {rwf(period.openingBalance.toString())}</p>
          <p className="text-sm text-[var(--muted)]">You can review the open period and enter operational records. Only an administrator can perform the final close because closing locks the month.</p>
        </div>
      )}
    </div>
  );
}
