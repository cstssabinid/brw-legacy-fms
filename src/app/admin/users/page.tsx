import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserCreateForm } from "./user-create-form";
import { UserManagementTable } from "./user-management-table";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const [session, users] = await Promise.all([
    getServerSession(authOptions),
    prisma.user.findMany({ where: { NOT: { email: { startsWith: "deleted+" } } }, orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, role: true, status: true } })
  ]);
  return <div className="grid gap-5"><h2 className="text-2xl font-black">Users and Roles</h2><UserCreateForm /><UserManagementTable users={users} currentUserId={session?.user.id ?? ""} /></div>;
}
