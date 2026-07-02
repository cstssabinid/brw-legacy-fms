"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false
    });
    setLoading(false);
    if (result?.error) {
      toast.error("Unauthorized access or invalid credentials");
      return;
    }
    router.push(params.get("callbackUrl") ?? "/admin/dashboard");
  }

  return (
    <form className="card grid gap-4 p-6" onSubmit={submit}>
      <input className="input" name="email" type="email" placeholder="Email" defaultValue="admin@brwlegacy.rw" required />
      <input className="input" name="password" type="password" placeholder="Password" defaultValue="Admin@12345" required />
      <button className="btn btn-primary" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
      <p className="text-sm text-[var(--muted)]">Local admin: admin@brwlegacy.rw / Admin@12345. Worker: worker@brwlegacy.rw / Worker@12345.</p>
    </form>
  );
}
