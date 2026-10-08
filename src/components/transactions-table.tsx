"use client";

import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { paymentMethods } from "@/lib/brand";
import { monthLabel, rwf } from "@/lib/utils";

type PeriodOption = { id: string; month: number; year: number; status: string };
type CategoryOption = { id: string; name: string; type: string };

export function TransactionsTable({ transactions, periods = [], categories = [], canEdit = false }: { transactions: any[]; periods?: PeriodOption[]; categories?: CategoryOption[]; canEdit?: boolean }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [periodId, setPeriodId] = useState("");
  const [date, setDate] = useState("");

  async function save(event: React.FormEvent<HTMLFormElement>, transactionId: string) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries()))
      });
      const data = await response.json();
      if (!response.ok) return toast.error(data.error ?? "Could not update transaction");
      toast.success("Transaction updated");
      setEditingId("");
      router.refresh();
    } catch {
      toast.error("Could not reach the transaction service");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card table-wrap">
      <table>
        <thead><tr><th>Date</th><th>Entry</th><th>Type</th><th>Category</th><th>Service</th><th>Package</th><th>Amount</th><th>Comments</th><th>Status</th><th>Recorded by</th>{canEdit && <th>Manage</th>}</tr></thead>
        <tbody>
          {transactions.length === 0 && <tr><td colSpan={canEdit ? 11 : 10} className="py-10 text-center text-[var(--muted)]">No transactions were recorded for this accounting month.</td></tr>}
          {transactions.map((item) => {
            const isEditing = editingId === item.id;
            const sourcePeriod = periods.find((period) => period.id === item.periodId);
            const selectedTargetPeriod = periods.find((period) => period.id === periodId);
            const needsCorrectionReason = sourcePeriod?.status === "CLOSED" || selectedTargetPeriod?.status === "CLOSED";
            return <Fragment key={item.id}>
              <tr key={item.id}>
                <td>{new Date(item.transactionDate).toLocaleDateString("en", { timeZone: "UTC" })}</td>
                <td>{item.isOpeningBalance ? "Opening balance" : "Operating"}</td>
                <td>{item.type}</td>
                <td>{item.category.name}</td>
                <td>{item.service?.name ?? "-"}</td>
                <td>{item.package?.name ?? "-"}</td>
                <td>{rwf(item.amount.toString())}</td>
                <td className="max-w-56 whitespace-normal">{item.comments ?? item.description ?? "-"}</td>
                <td>{item.status}</td>
                <td>{item.recordedBy?.name}</td>
                {canEdit && <td>{!item.isOpeningBalance ? <button className="btn border border-[var(--border)]" type="button" onClick={() => {
                  setEditingId(isEditing ? "" : item.id);
                  setPeriodId(item.periodId);
                  setDate(new Date(item.transactionDate).toISOString().slice(0, 10));
                }}>{isEditing ? "Cancel" : "Edit"}</button> : <span className="text-xs text-[var(--muted)]">Read only</span>}</td>}
              </tr>
              {isEditing && <tr key={`${item.id}-edit`}><td colSpan={11} className="whitespace-normal">
                <form className="grid gap-3 py-2 md:grid-cols-3" onSubmit={(event) => save(event, item.id)}>
                  <label className="grid gap-1 text-sm"><span>Accounting month</span><select className="input" name="periodId" value={periodId} required onChange={(event) => {
                    const next = periods.find((period) => period.id === event.target.value);
                    setPeriodId(event.target.value);
                    if (next) setDate(`${next.year}-${String(next.month).padStart(2, "0")}-01`);
                  }}>{periods.map((period) => <option key={period.id} value={period.id}>{monthLabel(period.month, period.year)} — {period.status}</option>)}</select></label>
                  <label className="grid gap-1 text-sm"><span>Date</span><input className="input" name="transactionDate" type="date" value={date} required onChange={(event) => {
                    const nextDate = event.target.value;
                    setDate(nextDate);
                    const matchingPeriod = periods.find((period) => `${period.year}-${String(period.month).padStart(2, "0")}` === nextDate.slice(0, 7));
                    if (matchingPeriod) setPeriodId(matchingPeriod.id);
                  }} /></label>
                  <label className="grid gap-1 text-sm"><span>Category</span><select className="input" name="categoryName" defaultValue={item.category.name} required>{categories.filter((category) => category.type === item.type).map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}</select></label>
                  <label className="grid gap-1 text-sm"><span>Payment method</span><select className="input" name="paymentMethod" defaultValue={item.paymentMethod} required>{paymentMethods.map((method) => <option key={method}>{method}</option>)}</select></label>
                  <label className="grid gap-1 text-sm"><span>Amount (RWF)</span><input className="input" name="amount" type="number" min="0.01" step="0.01" defaultValue={item.amount.toString()} required /></label>
                  <label className="grid gap-1 text-sm md:col-span-2"><span>Comments</span><textarea className="input min-h-20" name="comments" maxLength={1200} defaultValue={item.comments ?? item.description ?? ""} /></label>
                  {needsCorrectionReason && <label className="grid gap-1 text-sm md:col-span-2"><span>Correction reason for closed month</span><textarea className="input min-h-20" name="reason" minLength={3} maxLength={1200} placeholder="Explain why this transaction is being corrected" required /></label>}
                  <div className="flex items-end gap-2"><button className="btn btn-primary" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button><button className="btn border border-[var(--border)]" type="button" onClick={() => setEditingId("")}>Cancel</button></div>
                </form>
              </td></tr>}
            </Fragment>;
          })}
        </tbody>
      </table>
    </div>
  );
}
