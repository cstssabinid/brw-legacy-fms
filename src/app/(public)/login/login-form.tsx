"use client";

import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { defaultPortalPathForRole } from "@/lib/permissions";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const form = new FormData(event.currentTarget);
      const result = await signIn("credentials", {
        email: form.get("email"),
        password: form.get("password"),
        redirect: false
      });
      if (result?.error) {
        toast.error("Unauthorized access or invalid credentials");
        return;
      }

      const session = await getSession();
      router.push(params.get("callbackUrl") ?? defaultPortalPathForRole(session?.user.role));
      router.refresh();
    } catch {
      toast.error("Login could not be completed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card grid gap-4 p-6" onSubmit={submit}>
      <input className="input" name="email" type="email" placeholder="Email" autoComplete="username" required />
      <input className="input" name="password" type="password" placeholder="Password" autoComplete="current-password" required />
      <button className="btn btn-primary" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
      <p className="text-sm text-[var(--muted)]">Use the private administrator or worker credentials configured for this system.</p>
    </form>
  );
}
