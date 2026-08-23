"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function UserCreateForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setLoading(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 20_000);

    try {
      const form = new FormData(formElement);
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
        signal: controller.signal
      });
      const responseText = await response.text();
      let data: { error?: string } = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = {};
      }

      if (!response.ok) {
        toast.error(data.error ?? `Could not create user (error ${response.status})`);
        return;
      }

      toast.success("User account created");
      formElement.reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof DOMException && error.name === "AbortError"
        ? "User creation timed out. Please try again."
        : "Could not reach the user creation service. Please try again.");
    } finally {
      window.clearTimeout(timeout);
      setLoading(false);
    }
  }

  return (
    <form className="card grid gap-4 p-5" onSubmit={submit}>
      <h3 className="text-lg font-black">Add user account</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <input className="input" name="name" placeholder="Full name" required />
        <input className="input" name="email" type="email" placeholder="Email" required />
        <input className="input" name="phone" placeholder="Phone (optional)" />
        <select className="input" name="role" defaultValue="MANAGER">
          <option value="MANAGER">Cashier / Restricted staff</option>
          <option value="WORKER">Worker</option>
        </select>
        <input className="input" name="password" type="password" minLength={16} placeholder="Temporary password (16+ characters)" required />
      </div>
      <p className="text-sm text-[var(--muted)]">Restricted staff can enter operational information in the approved portal sections, but cannot delete records or open user and system administration pages.</p>
      <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Creating..." : "Create user"}</button>
    </form>
  );
}
