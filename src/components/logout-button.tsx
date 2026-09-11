"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { toast } from "sonner";

export function LogoutButton() {
  const [loggingOut, setLoggingOut] = useState(false);

  async function logout() {
    setLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/login" });
    } catch {
      setLoggingOut(false);
      toast.error("Logout could not be completed. Please try again.");
    }
  }

  return (
    <button
      className="btn border border-[var(--border)] bg-[var(--card)] text-sm hover:border-[var(--gold)]"
      type="button"
      onClick={logout}
      disabled={loggingOut}
    >
      <LogOut size={16} aria-hidden="true" />
      {loggingOut ? "Logging out..." : "Logout"}
    </button>
  );
}
