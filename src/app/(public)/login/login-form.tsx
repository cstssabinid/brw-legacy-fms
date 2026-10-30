"use client";

import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Banknote, Camera, Check, Eye, EyeOff, ShieldCheck } from "lucide-react";
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
  const [transitionDirection, setTransitionDirection] = useState<"forward" | "back">("forward");
  const reduceMotion = useReducedMotion();
  const stepOffset = reduceMotion ? 0 : transitionDirection === "forward" ? 24 : -24;
  const stepTransition = { duration: reduceMotion ? 0 : 0.28, ease: "easeOut" as const };

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

  const role = selectedRole ? LOGIN_ROLE_OPTIONS.find((option) => option.id === selectedRole)! : null;
  const Icon = selectedRole ? roleIcons[selectedRole] : null;
  return (
    <AnimatePresence mode="wait" initial={false}>
      {role && Icon ? (
        <motion.form
          key={`login-${role.id}`}
          className="staff-login-form"
          onSubmit={submit}
          initial={{ opacity: 0, x: stepOffset, filter: reduceMotion ? "blur(0px)" : "blur(6px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: -stepOffset, filter: reduceMotion ? "blur(0px)" : "blur(6px)" }}
          transition={stepTransition}
        >
          <p className="staff-login-step-label">Step 2 of 2 · Secure access</p>
          <h1 className="staff-login-heading">Welcome</h1>
          <p className="staff-login-subtitle">Sign in to your {role.label.toLowerCase()} account.</p>
          <div className="mb-4 flex items-center justify-center gap-2 text-xs font-semibold text-[var(--muted)]">
            <span className="staff-login-icon h-8 w-8"><Icon size={16} aria-hidden="true" /></span>
            <span>{role.label}</span>
          </div>
          <label className="staff-login-field">
            <span className="sr-only">Email address</span>
            <input name="email" type="email" placeholder="Email address" autoComplete="username" autoFocus required />
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
          <button className="staff-login-back" type="button" onClick={() => { setTransitionDirection("back"); setSelectedRole(null); setShowPassword(false); }} disabled={loading}>
            <ArrowLeft size={14} aria-hidden="true" /> Choose a different role
          </button>
        </motion.form>
      ) : (
        <motion.section
          key="role-selection"
          className="staff-login-role-step"
          aria-labelledby="role-selection-heading"
          initial={{ opacity: 0, x: stepOffset, filter: reduceMotion ? "blur(0px)" : "blur(6px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, x: -stepOffset, filter: reduceMotion ? "blur(0px)" : "blur(6px)" }}
          transition={stepTransition}
        >
          <p className="staff-login-step-label">Step 1 of 2 · Staff login</p>
          <h1 id="role-selection-heading" className="staff-login-heading">Choose your role</h1>
          <p className="staff-login-subtitle">Select the role assigned to your account to continue.</p>
          <div className="staff-login-role-list">
            {LOGIN_ROLE_OPTIONS.map((option) => {
              const RoleIcon = roleIcons[option.id];
              return (
                <motion.button
                  key={option.id}
                  type="button"
                  className="staff-login-role-button"
                  whileHover={reduceMotion ? undefined : { y: -2 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                  onClick={() => { setTransitionDirection("forward"); setSelectedRole(option.id); }}
                >
                  <span className="staff-login-icon"><RoleIcon size={19} aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">{option.label}</span>
                    <span className="mt-0.5 block text-xs text-[var(--muted)]">{option.description}</span>
                  </span>
                  <ArrowRight size={17} className="shrink-0 text-[var(--gold)]" aria-hidden="true" />
                </motion.button>
              );
            })}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
