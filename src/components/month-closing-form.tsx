"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type MonthClosingFormProps = {
  periodId: string;
  periodLabel: string;
  openingBalance: string;
  cashCountTotal: number;
};

export function MonthClosingForm({ periodId, periodLabel, openingBalance, cashCountTotal }: MonthClosingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      const response = await fetch("/api/month-closing", {
        method: "POST",
        body: JSON.stringify({ ...payload, periodId }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Cannot close month because pending records exist");
        return;
      }

      const nextPeriodLabel = new Date(data.nextPeriod.year, data.nextPeriod.month - 1, 1).toLocaleDateString("en", { month: "long", year: "numeric" });
      toast.success(`${periodLabel} closed. ${nextPeriodLabel} is now open with its opening balance recorded.`);
      router.refresh();
    } catch {
      toast.error("The month could not be closed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card grid gap-5 p-5" onSubmit={submit}>
      <div className="grid gap-2 border-b border-[var(--border)] pb-4">
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--gold)]">Closing {periodLabel}</p>
        <p className="text-sm text-[var(--muted)]">Opening balance brought forward: <strong className="text-[var(--foreground)]">{openingBalance}</strong>. Record the actual closing amount in each account below; the total becomes next month&apos;s opening balance and first income entry.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 mobile-stack">
        <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Cash at hand</span><input className="input" name="cash" type="number" min="0" step="0.01" defaultValue={cashCountTotal || 0} required /></label>
        <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">MoMo balance</span><input className="input" name="momo" type="number" min="0" step="0.01" defaultValue="0" required /></label>
        <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Bank balance</span><input className="input" name="bank" type="number" min="0" step="0.01" defaultValue="0" required /></label>
        <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Cheque amount</span><input className="input" name="cheque" type="number" min="0" step="0.01" defaultValue="0" required /></label>
        <label className="grid gap-2 md:col-span-2"><span className="text-sm font-semibold text-[var(--muted)]">Other account balances</span><input className="input" name="other" type="number" min="0" step="0.01" defaultValue="0" required /></label>
      </div>
      <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Difference reason</span><textarea className="input min-h-28" name="reason" placeholder="Required only when the recorded closing total differs from the expected balance" /></label>
      <button className="btn btn-gold" disabled={loading}>{loading ? "Closing month..." : "Confirm closing balance and open next month"}</button>
    </form>
  );
}
