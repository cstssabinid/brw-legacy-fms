import { ServiceType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSection } from "@/lib/server-permissions";

export const dynamic = "force-dynamic";

async function createService(formData: FormData) {
  "use server";
  const session = await requireAdminSection("/admin/services");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const type = String(formData.get("type") ?? "") as ServiceType;
  if (name.length < 2 || !Object.values(ServiceType).includes(type)) {
    throw new Error("Enter a valid service name and type");
  }

  const existing = await prisma.service.findFirst({ where: { name: { equals: name, mode: "insensitive" } } });
  if (existing) throw new Error("A service with this name already exists");

  const service = await prisma.service.create({ data: { name, description: description || undefined, type, active: true } });
  await prisma.auditLog.create({
    data: { userId: session.user.id, action: "Service created", entityType: "Service", entityId: service.id, newValue: { name, type } }
  });
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/booking");
}

export default async function AdminServicesPage() {
  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-black">Service Management</h2>
      <form action={createService} className="card grid gap-4 p-5">
        <h3 className="text-lg font-black">Add Service</h3>
        <div className="grid gap-4 md:grid-cols-2 mobile-stack">
          <input className="input" name="name" minLength={2} placeholder="Service name" required />
          <select className="input" name="type" defaultValue="PHOTOGRAPHY" required>
            {Object.values(ServiceType).map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <textarea className="input min-h-24" name="description" placeholder="Description (optional)" />
        <button className="btn btn-primary w-fit" type="submit">Add Service</button>
      </form>
      <div className="responsive-grid">
        {services.map((service) => (
          <article className="card p-4" key={service.id}>
            <h3 className="font-black">{service.name}</h3>
            <p className="text-sm text-[var(--muted)]">{service.type}</p>
            {service.description && <p className="mt-2 text-sm">{service.description}</p>}
          </article>
        ))}
      </div>
    </div>
  );
}
