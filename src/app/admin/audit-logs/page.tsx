import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AuditLogsPage() {
  const logs = await prisma.auditLog.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 100 });
  return <div className="grid gap-5"><h2 className="text-2xl font-black">Audit Logs</h2><div className="card table-wrap"><table><thead><tr><th>Date</th><th>User</th><th>Action</th><th>Entity</th><th>Reason</th></tr></thead><tbody>{logs.map((log) => <tr key={log.id}><td>{log.createdAt.toLocaleString()}</td><td>{log.user?.name ?? "System"}</td><td>{log.action}</td><td>{log.entityType}</td><td>{log.reason ?? "-"}</td></tr>)}</tbody></table></div></div>;
}
