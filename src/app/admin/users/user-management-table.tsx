"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type ManagedUser = { id: string; name: string; email: string; role: string; status: string };

export function UserManagementTable({ users, currentUserId }: { users: ManagedUser[]; currentUserId: string }) {
  const router = useRouter();
  const [roles, setRoles] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState("");

  async function changeRole(user: ManagedUser) {
    const role = roles[user.id] ?? user.role;
    if (role === user.role) return;
    setSavingId(user.id);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, role })
      });
      const data = await response.json();
      if (!response.ok) return toast.error(data.error ?? "Could not update role");
      toast.success("User role updated");
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
                <td>{user.name}</td><td>{user.email}</td>
                <td>
                  {canManage ? (
                    <select className="input min-w-36" aria-label={`Role for ${user.name}`} value={roles[user.id] ?? user.role} onChange={(event) => setRoles((current) => ({ ...current, [user.id]: event.target.value }))}>
                      <option value="CASHIER">Cashier</option><option value="MANAGER">Manager (legacy)</option><option value="WORKER">Photographer</option>
                    </select>
                  ) : user.role}
                </td>
                <td>{user.status}</td>
                <td>
                  {canManage ? <div className="flex flex-wrap gap-2">
                    <button className="btn btn-primary" type="button" disabled={savingId === user.id || (roles[user.id] ?? user.role) === user.role} onClick={() => changeRole(user)}>{savingId === user.id ? "Saving..." : "Modify role"}</button>
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
