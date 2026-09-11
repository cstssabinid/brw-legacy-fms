"use client";

import { useRouter } from "next/navigation";
import { useState, useMemo } from "react";
import { toast } from "sonner";

type MonthClosingFormProps = {
  periodId: string;
  periodLabel: string;
  year: number;
  month: number;
  openingBalance: string;
  cashCountTotal: number;
};

export function MonthClosingForm({ periodId, periodLabel, year, month, openingBalance, cashCountTotal }: MonthClosingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [closingDate, setClosingDate] = useState(new Date().toISOString().split("T")[0]);
  const [openingDate, setOpeningDate] = useState("");

  const nextMonthInfo = useMemo(() => {
    const nextStart = new Date(year, month, 1);
    const nextMonth = nextStart.getMonth() + 1;
    const nextYear = nextStart.getFullYear();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return {
      month: nextMonth,
      year: nextYear,
      label: `${monthNames[nextMonth - 1]} ${nextYear}`,
      defaultDate: new Date(nextYear, nextMonth - 1, 1).toISOString().split("T")[0]
    };
  }, [year, month]);

  const handleOpeningDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpeningDate(e.target.value);
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!closingDate) {
      toast.error("Please select a closing date");
      return;
    }
    if (!openingDate) {
      toast.error("Please select an opening date");
      return;
    }

    setLoading(true);
    try {
      const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
      const response = await fetch("/api/month-closing", {
        method: "POST",
        body: JSON.stringify({ ...payload, periodId, closingDate, openingDate }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error ?? "Cannot close month because pending records exist");
        return;
      }

      const nextPeriodLabel = new Date(data.nextPeriod.year, data.nextPeriod.month - 1, 1).toLocaleDateString("en", { month: "long", year: "numeric" });
      toast.success(`${periodLabel} closed on ${new Date(closingDate).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" })}. ${nextPeriodLabel} opened on ${new Date(openingDate).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" })} with opening balance recorded.`);
      router.refresh();
    } catch {
      toast.error("The month could not be closed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card grid gap-5 p-5" onSubmit={submit}>
      <div className="grid gap-4 border-b border-[var(--border)] pb-4 md:grid-cols-2 mobile-stack">
        <div className="grid gap-2">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--gold)]">Closing {periodLabel}</p>
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--muted)]">Closing date</span>
            <input className="input" type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} required />
          </label>
        </div>
        <div className="grid gap-2">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--gold)]">Opening {nextMonthInfo.label}</p>
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--muted)]">Opening date</span>
            <input className="input" type="date" value={openingDate} onChange={handleOpeningDateChange} defaultValue={nextMonthInfo.defaultDate} required />
          </label>
        </div>
      </div>
      <div className="grid gap-2">
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
