"use client";

import { useState } from "react";
import { toast } from "sonner";
import { expenseCategories, incomeCategories, paymentMethods } from "@/lib/brand";
import type { CatalogPackage } from "@/lib/catalog";
import { monthLabel } from "@/lib/utils";

type PeriodOption = { id: string; month: number; year: number; status: string };

function todayForPeriod(period?: PeriodOption) {
  const now = new Date();
  if (period && (now.getMonth() + 1 !== period.month || now.getFullYear() !== period.year)) {
    return `${period.year}-${String(period.month).padStart(2, "0")}-01`;
  }
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function TransactionForm({ type = "INCOME", services = [], packages = [], periods }: { type?: "INCOME" | "EXPENSE"; services?: string[]; packages?: CatalogPackage[]; periods?: PeriodOption[] }) {
  const [loading, setLoading] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const [selectedPeriodId, setSelectedPeriodId] = useState(periods?.find((period) => period.status !== "CLOSED")?.id ?? periods?.[0]?.id ?? "");
  const selectedPeriod = periods?.find((period) => period.id === selectedPeriodId);
  const [transactionDate, setTransactionDate] = useState(() => todayForPeriod(selectedPeriod));
  const categories = type === "INCOME" ? incomeCategories : expenseCategories;
  const availablePackages = packages.filter((item) => !serviceName || item.serviceName === serviceName);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const formElement = event.currentTarget;
    const payload = Object.fromEntries(new FormData(formElement).entries());
    try {
      const res = await fetch("/api/transactions", { method: "POST", body: JSON.stringify({ ...payload, type }), headers: { "Content-Type": "application/json" } });
      const data = await res.json();
      if (!res.ok) return toast.error(data.error ?? "Failed to save transaction");
      toast.success("Transaction saved");
      formElement.reset();
      setTransactionDate(todayForPeriod(selectedPeriod));
    } catch {
      toast.error("Could not reach the transaction service");
    } finally {
      setLoading(false);
    }
  }
  return (
    <form className="card grid gap-4 p-5" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2 mobile-stack">
        {periods && <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Accounting month</span><select className="input" name="periodId" value={selectedPeriodId} required onChange={(event) => {
          setSelectedPeriodId(event.target.value);
          setTransactionDate(todayForPeriod(periods.find((period) => period.id === event.target.value)));
        }}>{periods.map((period) => <option key={period.id} value={period.id}>{monthLabel(period.month, period.year)} — {period.status}</option>)}</select></label>}
        <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Category</span><select className="input" name="categoryName" required>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Payment method</span><select className="input" name="paymentMethod" required>{paymentMethods.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Amount (RWF)</span><input className="input" name="amount" type="number" min="1" placeholder="Amount" required /></label>
        <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Date</span><input className="input" name="transactionDate" type="date" value={transactionDate} onChange={(event) => {
          const nextDate = event.target.value;
          setTransactionDate(nextDate);
          const matchingPeriod = periods?.find((period) => `${period.year}-${String(period.month).padStart(2, "0")}` === nextDate.slice(0, 7));
          if (matchingPeriod) setSelectedPeriodId(matchingPeriod.id);
        }} required /></label>
        {type === "INCOME" && (
          <>
            <select className="input" name="serviceName" value={serviceName} onChange={(event) => setServiceName(event.target.value)}>
              <option value="">Service optional</option>
              {services.map((service) => <option key={service}>{service}</option>)}
            </select>
            <select className="input" name="packageName">
              <option value="">Package optional</option>
              {availablePackages.map((item) => <option key={item.id ?? item.name} value={item.name}>{item.name}</option>)}
            </select>
          </>
        )}
      </div>
      <textarea className="input min-h-24" name="comments" placeholder="Comments" />
      {selectedPeriod?.status === "CLOSED" && <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Correction reason for the closed month</span><textarea className="input min-h-20" name="reason" minLength={3} maxLength={1200} placeholder="Explain why this transaction is being entered late" required /></label>}
      <button className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : `Save ${type.toLowerCase()}`}</button>
    </form>
  );
}
