"use client";

import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Banknote, Camera, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { defaultPortalPathForRole } from "@/lib/permissions";
import { LOGIN_ROLE_OPTIONS, type LoginRole } from "@/lib/login-roles";

const roleIcons = {
  ADMIN: ShieldCheck,
  PHOTOGRAPHER: Camera,
  CASHIER: Banknote
};

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<LoginRole | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedRole) {
      toast.error("Choose your role before signing in");
      return;
    }
    setLoading(true);
    try {
      const form = new FormData(event.currentTarget);
      const result = await signIn("credentials", {
        email: form.get("email"),
        password: form.get("password"),
        loginRole: selectedRole,
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

  if (!selectedRole) {
    return (
      <section className="card grid gap-4 p-6" aria-labelledby="role-selection-heading">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--gold)]">Step 1 of 2</p>
          <h2 id="role-selection-heading" className="mt-1 text-xl font-black">Select your role</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Choose the role assigned to your account before entering your credentials.</p>
        </div>
        <div className="grid gap-3">
          {LOGIN_ROLE_OPTIONS.map((role) => {
            const Icon = roleIcons[role.id];
            return (
              <button
                key={role.id}
                type="button"
                className="group flex w-full items-center gap-4 rounded-lg border border-[var(--border)] px-4 py-4 text-left transition hover:border-[var(--gold)] hover:bg-[color:color-mix(in_srgb,var(--gold)_8%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--gold)]"
                onClick={() => setSelectedRole(role.id)}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--navy)] text-white"><Icon size={20} aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-black">{role.label}</span>
                  <span className="mt-0.5 block text-sm text-[var(--muted)]">{role.description}</span>
                </span>
                <span className="text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:text-[var(--gold)]" aria-hidden="true">›</span>
              </button>
            );
          })}
        </div>
      </section>
    );
  }

  const role = LOGIN_ROLE_OPTIONS.find((option) => option.id === selectedRole)!;
  const Icon = roleIcons[selectedRole];

  return (
    <form className="card grid gap-4 p-6" onSubmit={submit}>
      <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-black/[0.02] p-3 dark:bg-white/[0.03]">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-[var(--navy)] text-white"><Icon size={18} aria-hidden="true" /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Signing in as</p>
            <p className="font-black">{role.label}</p>
          </div>
        </div>
        <button type="button" className="text-sm font-bold text-[var(--navy)] underline-offset-4 hover:underline dark:text-[var(--gold)]" onClick={() => setSelectedRole(null)} disabled={loading}>Change</button>
      </div>
      <input className="input" name="email" type="email" placeholder="Email" autoComplete="username" required />
      <input className="input" name="password" type="password" placeholder="Password" autoComplete="current-password" required />
      <button className="btn btn-primary" disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
      <p className="flex items-center gap-2 text-sm text-[var(--muted)]"><Check size={16} className="text-[var(--gold)]" aria-hidden="true" /> Your account must be authorised for the selected role.</p>
    </form>
  );
}
