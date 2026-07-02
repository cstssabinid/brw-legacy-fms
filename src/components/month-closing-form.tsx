"use client";

import { useState } from "react";
import { toast } from "sonner";

export function MonthClosingForm({ periodId }: { periodId: string }) {
  const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const res = await fetch("/api/month-closing", { method: "POST", body: JSON.stringify({ ...payload, periodId }), headers: { "Content-Type": "application/json" } });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return toast.error(data.error ?? "Cannot close month because pending records exist");
    toast.success(`Month closed. Difference: ${data.difference}`);
  }
  return (
    <form className="card grid gap-4 p-5" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2 mobile-stack">
        <input className="input" name="cash" type="number" min="0" placeholder="Cash at hand" required />
        <input className="input" name="momo" type="number" min="0" placeholder="MoMo balance" required />
        <input className="input" name="bank" type="number" min="0" placeholder="Bank balance" required />
        <input className="input" name="cheque" type="number" min="0" placeholder="Cheque amount" defaultValue="0" />
        <input className="input" name="other" type="number" min="0" placeholder="Other account balances" defaultValue="0" />
      </div>
      <textarea className="input min-h-28" name="reason" placeholder="Reason if counted balance differs from expected balance" />
      <button className="btn btn-gold" disabled={loading}>{loading ? "Checking..." : "Confirm and Close Month"}</button>
    </form>
  );
}
