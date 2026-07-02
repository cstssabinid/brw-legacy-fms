"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { CatalogPackage } from "@/lib/catalog";

export function BookingForm({ services, packages }: { services: string[]; packages: CatalogPackage[] }) {
  const [loading, setLoading] = useState(false);
  const [desiredPackage, setDesiredPackage] = useState("");
  const [desiredService, setDesiredService] = useState(services[0] ?? "");
  const availablePackages = useMemo(() => packages.filter((item) => !desiredService || item.serviceName === desiredService), [packages, desiredService]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const packageName = params.get("package");
    const serviceName = params.get("service");
    const selectedPackage = packages.find((item) => item.name === packageName);
    if (selectedPackage) {
      setDesiredPackage(selectedPackage.name);
      if (selectedPackage.serviceName) setDesiredService(selectedPackage.serviceName);
    }
    if (serviceName && services.includes(serviceName)) {
      setDesiredService(serviceName);
    }
  }, [packages, services]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const res = await fetch("/api/bookings", { method: "POST", body: JSON.stringify(payload), headers: { "Content-Type": "application/json" } });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      toast.error(data.error ?? "Failed to save booking");
      return;
    }
    toast.success("Booking submitted successfully");
    event.currentTarget.reset();
    setDesiredPackage("");
    setDesiredService(services[0] ?? "");
  }

  return (
    <form className="card grid gap-4 p-6" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2 mobile-stack">
        <input className="input" name="fullName" placeholder="Client full name" required />
        <input className="input" name="phone" placeholder="Phone number" required />
        <input className="input" name="email" type="email" placeholder="Email optional" />
        <select className="input" name="desiredService" required value={desiredService} onChange={(event) => setDesiredService(event.target.value)}>
          {services.map((service) => <option key={service}>{service}</option>)}
        </select>
        <select className="input" name="desiredPackage" value={desiredPackage} onChange={(event) => setDesiredPackage(event.target.value)}>
          <option value="">Desired package optional</option>
          {availablePackages.map((item) => <option key={`${item.name}-${item.price}`} value={item.name}>{item.name}</option>)}
        </select>
        <input className="input" name="bookingDate" type="date" required />
        <input className="input" name="bookingTime" type="time" required />
        <select className="input" name="locationType" required>
          <option value="STUDIO">Studio</option>
          <option value="OUTDOOR">Outdoor</option>
          <option value="WEDDING_VENUE">Wedding venue</option>
          <option value="EVENT_VENUE">Event venue</option>
          <option value="OTHER">Other</option>
        </select>
        <input className="input" name="location" placeholder="Event or session location" />
        <input className="input" name="numberOfPeople" type="number" min="1" placeholder="Number of people optional" />
        <select className="input" name="paymentStatus" required defaultValue="NO_PAYMENT">
          <option value="NO_PAYMENT">No payment</option>
          <option value="DEPOSIT_PAID">Deposit paid</option>
          <option value="FULLY_PAID">Fully paid</option>
        </select>
        <input className="input" name="depositAmount" type="number" min="0" defaultValue="0" placeholder="Deposit amount" />
      </div>
      <textarea className="input min-h-32" name="specialRequest" placeholder="Special request" />
      <button className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : "Submit Booking"}</button>
    </form>
  );
}
