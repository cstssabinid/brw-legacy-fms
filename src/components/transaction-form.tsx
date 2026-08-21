"use client";

import { useState } from "react";
import { toast } from "sonner";
import { expenseCategories, incomeCategories, paymentMethods } from "@/lib/brand";
import type { CatalogPackage } from "@/lib/catalog";

export function TransactionForm({ type = "INCOME", services = [], packages = [] }: { type?: "INCOME" | "EXPENSE"; services?: string[]; packages?: CatalogPackage[] }) {
  const [loading, setLoading] = useState(false);
  const [serviceName, setServiceName] = useState("");
  const categories = type === "INCOME" ? incomeCategories : expenseCategories;
  const availablePackages = packages.filter((item) => !serviceName || item.serviceName === serviceName);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const res = await fetch("/api/transactions", { method: "POST", body: JSON.stringify({ ...payload, type }), headers: { "Content-Type": "application/json" } });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return toast.error(data.error ?? "Failed to save transaction");
    toast.success("Transaction saved");
    event.currentTarget.reset();
  }
  return (
    <form className="card grid gap-4 p-5" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2 mobile-stack">
        <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Category</span><select className="input" name="categoryName" required>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Payment method</span><select className="input" name="paymentMethod" required>{paymentMethods.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Amount (RWF)</span><input className="input" name="amount" type="number" min="1" placeholder="Amount" required /></label>
        <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Date</span><input className="input" name="transactionDate" type="date" required /></label>
        <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Time</span><input className="input" name="transactionTime" type="time" required /></label>
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
      <input className="input" name="description" placeholder="Description" />
      <textarea className="input min-h-24" name="comments" placeholder="Comments / notes" />
      <button className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : `Save ${type.toLowerCase()}`}</button>
    </form>
  );
}
