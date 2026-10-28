"use client";

import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Banknote, Camera, Check, Eye, EyeOff, ShieldCheck } from "lucide-react";
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
  const [showPassword, setShowPassword] = useState(false);

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
      <section className="staff-login-role-step" aria-labelledby="role-selection-heading">
        <p className="staff-login-step-label">Step 1 of 2 · Staff login</p>
        <h1 id="role-selection-heading" className="staff-login-heading">Choose your role</h1>
        <p className="staff-login-subtitle">Select the role assigned to your account to continue.</p>
        <div className="staff-login-role-list">
          {LOGIN_ROLE_OPTIONS.map((role) => {
            const Icon = roleIcons[role.id];
            return (
              <button
                key={role.id}
                type="button"
                className="staff-login-role-button"
                onClick={() => setSelectedRole(role.id)}
              >
                <span className="staff-login-icon"><Icon size={19} aria-hidden="true" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold">{role.label}</span>
                  <span className="mt-0.5 block text-xs text-[var(--muted)]">{role.description}</span>
                </span>
                <ArrowRight size={17} className="shrink-0 text-[var(--gold)]" aria-hidden="true" />
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
    <form className="staff-login-form" onSubmit={submit}>
      <p className="staff-login-step-label">Step 2 of 2 · Secure access</p>
      <h1 className="staff-login-heading">Welcome</h1>
      <p className="staff-login-subtitle">Sign in to your {role.label.toLowerCase()} account.</p>
      <div className="mb-4 flex items-center justify-center gap-2 text-xs font-semibold text-[var(--muted)]">
        <span className="staff-login-icon h-8 w-8"><Icon size={16} aria-hidden="true" /></span>
        <span>{role.label}</span>
      </div>
      <label className="staff-login-field">
        <span className="sr-only">Email address</span>
        <input name="email" type="email" placeholder="Email address" autoComplete="username" required />
      </label>
      <label className="staff-login-field staff-login-field-password">
        <span className="sr-only">Password</span>
        <input name="password" type={showPassword ? "text" : "password"} placeholder="Password" autoComplete="current-password" required />
        <button
          className="staff-login-eye"
          type="button"
          aria-label={showPassword ? "Hide password" : "Show password"}
          aria-pressed={showPassword}
          onClick={() => setShowPassword((visible) => !visible)}
        >
          {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
        </button>
      </label>
      <button className="staff-login-submit" type="submit" disabled={loading}>{loading ? "Signing in..." : "LOGIN"}</button>
      <p className="staff-login-note"><Check size={15} aria-hidden="true" /> Your account must be authorised for this role.</p>
      <button className="staff-login-back" type="button" onClick={() => setSelectedRole(null)} disabled={loading}>Change staff role</button>
    </form>
  );
}
