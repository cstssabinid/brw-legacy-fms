"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard } from "lucide-react";
import { toast } from "sonner";

export function BookingPaymentForm({ bookingId, remainingAmount }: { bookingId: string; remainingAmount: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    const res = await fetch(`/api/bookings/${bookingId}/payments`, { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return toast.error(data.error ?? "Payment could not be recorded");
    toast.success("Payment confirmed and income recorded");
    event.currentTarget.reset();
    router.refresh();
  }

  return (
    <form className="mt-4 grid gap-3 rounded-lg border border-[var(--border)] p-4" onSubmit={submit}>
      <p className="flex items-center gap-2 font-black"><CreditCard size={17} /> Record Payment</p>
      <div className="grid gap-3 md:grid-cols-2">
        <input className="input" name="amount" type="number" min="1" max={remainingAmount || undefined} placeholder="Amount paid" required />
        <select className="input" name="paymentMethod" required>
          <option>MTN MoMo</option>
          <option>Bank Transfer</option>
          <option>Cash</option>
          <option>Cheque</option>
          <option>Other</option>
        </select>
        <input className="input" name="paymentReference" placeholder="Payment reference optional" />
        <select className="input" name="proofReceivedThrough" required>
          <option>WhatsApp</option>
          <option>Email</option>
          <option>Physical Receipt</option>
          <option>Bank Confirmation</option>
          <option>MoMo Confirmation</option>
          <option>Other</option>
        </select>
      </div>
      <input className="input" name="proofAttachmentUrl" placeholder="Internal proof attachment URL optional" />
      <textarea className="input min-h-20" name="notes" placeholder="Admin payment notes" />
      <button className="btn btn-primary" disabled={loading || remainingAmount <= 0}>{loading ? "Recording..." : "Confirm Payment"}</button>
    </form>
  );
}
