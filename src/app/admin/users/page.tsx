import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return <div className="grid gap-5"><h2 className="text-2xl font-black">Users and Roles</h2><div className="card table-wrap"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead><tbody>{users.map((user) => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{user.role}</td><td>{user.status}</td></tr>)}</tbody></table></div></div>;
}
