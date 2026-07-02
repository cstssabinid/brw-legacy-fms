import { prisma } from "@/lib/prisma";
import { SimpleAdminPage } from "@/components/simple-admin-page";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });
  return <SimpleAdminPage title="Service Management"><div className="responsive-grid">{services.map((service) => <article className="card p-3" key={service.id}>{service.name}</article>)}</div></SimpleAdminPage>;
}
