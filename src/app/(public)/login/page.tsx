import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="staff-login-page">
      <div className="staff-login-ambient-ring" aria-hidden="true" />
      <div className="staff-login-content">
        <div className="staff-login-topbar">
          <Link href="/" className="staff-login-brand">BRW LEGACY <span>/ STAFF ACCESS</span></Link>
          <Link href="/" className="staff-login-home"><ArrowLeft size={15} aria-hidden="true" /> <span>Home</span></Link>
        </div>
        <section className="staff-login-stage" aria-label="Staff sign-in">
          <span className="staff-login-corner staff-login-corner-top" aria-hidden="true" />
          <span className="staff-login-corner staff-login-corner-bottom" aria-hidden="true" />
          <div className="staff-login-body">
            <Suspense fallback={<div className="staff-login-heading">Loading secure sign-in...</div>}>
              <LoginForm />
            </Suspense>
          </div>
        </section>
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">BRW Legacy Financial Management System</p>
      </div>
    </main>
  );
}
