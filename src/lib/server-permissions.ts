import "server-only";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { canAccessAdminPath } from "@/lib/permissions";

export async function requireAdminSection(pathname: string) {
  const session = await getServerSession(authOptions);
  if (!session || !canAccessAdminPath(session.user.role, pathname)) {
    throw new Error("You do not have permission to change this section");
  }
  return session;
}
