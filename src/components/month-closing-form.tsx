"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type ClosingBalances = {
  cash: number;
  momo: number;
  bank: number;
  cheque: number;
  other: number;
};

type MonthClosingFormProps = {
  periodId: string;
  periodLabel: string;
  year: number;
  month: number;
  openingBalance: string;
  defaultClosingBalances: ClosingBalances;
  defaultClosingDate?: string;
  defaultOpeningDate?: string;
  isReclosing: boolean;
};

function dateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function MonthClosingForm({
  periodId,
  periodLabel,
  year,
  month,
  openingBalance,
  defaultClosingBalances,
  defaultClosingDate,
  defaultOpeningDate,
  isReclosing
}: MonthClosingFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const nextStart = new Date(year, month, 1);
  const nextMonth = nextStart.getMonth() + 1;
  const nextYear = nextStart.getFullYear();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const nextMonthInfo = {
    month: nextMonth,
    year: nextYear,
    label: `${monthNames[nextMonth - 1]} ${nextYear}`,
    defaultDate: dateInputValue(new Date(nextYear, nextMonth - 1, 1))
  };
  const [closingDate, setClosingDate] = useState(defaultClosingDate ?? dateInputValue(new Date()));
  const [openingDate, setOpeningDate] = useState(defaultOpeningDate ?? nextMonthInfo.defaultDate);

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
        toast.error(data.error ?? "The month could not be closed");
        return;
      }

      const nextPeriodLabel = new Date(data.nextPeriod.year, data.nextPeriod.month - 1, 1).toLocaleDateString("en", { month: "long", year: "numeric" });
      toast.success(isReclosing
        ? `${periodLabel} reclosed. ${nextPeriodLabel} opening balance has been updated.`
        : `${periodLabel} closed. ${nextPeriodLabel} opening balance has been recorded.`);
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
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--gold)]">{isReclosing ? `Reclosing ${periodLabel}` : `Closing ${periodLabel}`}</p>
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--muted)]">Closing date</span>
            <input className="input" type="date" value={closingDate} onChange={(event) => setClosingDate(event.target.value)} required />
          </label>
        </div>
        <div className="grid gap-2">
          <p className="text-sm font-bold uppercase tracking-[0.14em] text-[var(--gold)]">Opening {nextMonthInfo.label}</p>
          <label className="grid gap-2">
            <span className="text-xs font-semibold text-[var(--muted)]">Opening date</span>
            <input className="input" type="date" value={openingDate} onChange={(event) => setOpeningDate(event.target.value)} required />
          </label>
        </div>
      </div>
      <p className="text-sm text-[var(--muted)]">
        Opening balance brought forward: <strong className="text-[var(--foreground)]">{openingBalance}</strong>. The recorded closing amounts become {nextMonthInfo.label}&apos;s opening balance.
        {isReclosing && " Reclosing recalculates that opening balance and preserves transactions and recorded counts in later closed months."}
      </p>
      <div className="grid gap-4 md:grid-cols-2 mobile-stack">
        <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Cash at hand</span><input className="input" name="cash" type="number" min="0" step="0.01" defaultValue={defaultClosingBalances.cash} required /></label>
        <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">MoMo balance</span><input className="input" name="momo" type="number" min="0" step="0.01" defaultValue={defaultClosingBalances.momo} required /></label>
        <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Bank balance</span><input className="input" name="bank" type="number" min="0" step="0.01" defaultValue={defaultClosingBalances.bank} required /></label>
        <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Cheque amount</span><input className="input" name="cheque" type="number" min="0" step="0.01" defaultValue={defaultClosingBalances.cheque} required /></label>
        <label className="grid gap-2 md:col-span-2"><span className="text-sm font-semibold text-[var(--muted)]">Other account balances</span><input className="input" name="other" type="number" min="0" step="0.01" defaultValue={defaultClosingBalances.other} required /></label>
      </div>
      <label className="grid gap-2">
        <span className="text-sm font-semibold text-[var(--muted)]">{isReclosing ? "Reclose reason / difference reason" : "Difference reason"}</span>
        <textarea className="input min-h-28" name="reason" placeholder={isReclosing ? "Explain the correction before reclosing this month" : "Required when the recorded closing total differs from the expected balance"} required={isReclosing} />
      </label>
      <button className="btn btn-gold" disabled={loading}>
        {loading ? (isReclosing ? "Reclosing month..." : "Closing month...") : (isReclosing ? "Reclose month and update next opening balance" : "Confirm closing balance and open next month")}
      </button>
    </form>
  );
}
