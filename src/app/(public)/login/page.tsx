import { LoginForm } from "./login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <main className="page-shell grid min-h-[76vh] place-items-center py-12">
      <section className="w-full max-w-md">
        <h1 className="mb-5 text-4xl font-black">Secure Login</h1>
        <Suspense fallback={<div className="card p-6">Loading login...</div>}>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
