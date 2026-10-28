"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type ManagedUser = { id: string; name: string; email: string; role: string; status: string };

export function UserManagementTable({ users, currentUserId }: { users: ManagedUser[]; currentUserId: string }) {
  const router = useRouter();
  const [savingId, setSavingId] = useState("");

  async function updateUser(event: React.FormEvent<HTMLFormElement>, user: ManagedUser) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
    setSavingId(user.id);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) return toast.error(data.error ?? "Could not update account");
      toast.success("User account updated");
      router.refresh();
    } catch {
      toast.error("Could not reach the user management service");
    } finally {
      setSavingId("");
    }
  }

  async function deleteUser(user: ManagedUser) {
    if (!window.confirm(`Delete the account for ${user.name}? Their transaction history will remain for accounting records.`)) return;
    setSavingId(user.id);
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id })
      });
      const data = await response.json();
      if (!response.ok) return toast.error(data.error ?? "Could not delete account");
      toast.success("User account deleted");
      router.refresh();
    } catch {
      toast.error("Could not reach the user management service");
    } finally {
      setSavingId("");
    }
  }

  return (
    <div className="card table-wrap">
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Manage</th></tr></thead>
        <tbody>
          {users.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-[var(--muted)]">No user accounts yet.</td></tr>}
          {users.map((user) => {
            const canManage = user.id !== currentUserId && ["CASHIER", "MANAGER", "WORKER"].includes(user.role);
            return (
              <tr key={user.id}>
                <td>{user.name}</td><td>{user.email}</td><td>{user.role}</td><td>{user.status}</td>
                <td>
                  {canManage ? <div className="grid min-w-56 gap-2">
                    <details>
                      <summary className="cursor-pointer font-bold">Select and edit user</summary>
                      <form className="mt-3 grid min-w-64 gap-3" onSubmit={(event) => updateUser(event, user)}>
                        <input type="hidden" name="id" value={user.id} />
                        <label className="grid gap-1 text-sm"><span>Full name</span><input className="input" name="name" defaultValue={user.name} minLength={2} maxLength={120} required /></label>
                        <label className="grid gap-1 text-sm"><span>Email</span><input className="input" name="email" type="email" defaultValue={user.email} required /></label>
                        <label className="grid gap-1 text-sm"><span>Role</span><select className="input" name="role" defaultValue={user.role}><option value="CASHIER">Cashier</option><option value="MANAGER">Manager (legacy)</option><option value="WORKER">Photographer</option></select></label>
                        <label className="grid gap-1 text-sm"><span>Status</span><select className="input" name="status" defaultValue={user.status}><option value="ACTIVE">Active</option><option value="SUSPENDED">Suspended</option></select></label>
                        <button className="btn btn-primary" type="submit" disabled={savingId === user.id}>{savingId === user.id ? "Saving..." : "Save user"}</button>
                      </form>
                    </details>
                    <button className="btn border border-red-400/50 text-red-700" type="button" disabled={savingId === user.id} onClick={() => deleteUser(user)}>{savingId === user.id ? "Saving..." : "Delete account"}</button>
                  </div> : <span className="text-sm text-[var(--muted)]">Protected</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
