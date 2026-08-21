"use client";

import { useState } from "react";
import { toast } from "sonner";

export function UserCreateForm() {
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries()))
    });
    const data = await response.json();
    setLoading(false);
    if (!response.ok) return toast.error(data.error ?? "Could not create user");
    toast.success("User account created");
    event.currentTarget.reset();
    window.location.reload();
  }

  return (
    <form className="card grid gap-4 p-5" onSubmit={submit}>
      <h3 className="text-lg font-black">Add user account</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <input className="input" name="name" placeholder="Full name" required />
        <input className="input" name="email" type="email" placeholder="Email" required />
        <input className="input" name="phone" placeholder="Phone (optional)" />
        <select className="input" name="role" defaultValue="CASHIER">
          <option value="CASHIER">Cashier</option>
          <option value="WORKER">Worker</option>
        </select>
        <input className="input" name="password" type="password" minLength={16} placeholder="Temporary password (16+ characters)" required />
      </div>
      <button className="btn btn-primary" disabled={loading}>{loading ? "Creating..." : "Create user"}</button>
    </form>
  );
}