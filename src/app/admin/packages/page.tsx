import { PackageType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { rwf } from "@/lib/utils";

export const dynamic = "force-dynamic";

const levels = ["Bronze", "Silver", "Gold", "Platinum"];

function levelFromDescription(description?: string | null) {
  return description?.match(/^(Bronze|Silver|Gold|Platinum) level\./)?.[1] ?? "";
}

function normalizeIncludes(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function descriptionFor(level: string, packageType: string) {
  return `${level ? `${level} level. ` : ""}${packageType.toLowerCase()} package for Berwa Photo Hub.`;
}

async function refreshPackageViews() {
  "use server";
  revalidatePath("/");
  revalidatePath("/packages");
  revalidatePath("/services");
  revalidatePath("/booking");
  revalidatePath("/admin/packages");
}

async function createPackage(formData: FormData) {
  "use server";
  const serviceId = String(formData.get("serviceId"));
  const name = String(formData.get("name"));
  const level = String(formData.get("level") ?? "");
  const packageType = String(formData.get("packageType")) as PackageType;
  const price = Number(formData.get("price"));
  const includes = normalizeIncludes(formData.get("includes"));

  await prisma.package.create({
    data: { serviceId, name, packageType, price, includes, description: descriptionFor(level, packageType) }
  });
  await refreshPackageViews();
}

async function updatePackage(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const serviceId = String(formData.get("serviceId"));
  const name = String(formData.get("name"));
  const level = String(formData.get("level") ?? "");
  const packageType = String(formData.get("packageType")) as PackageType;
  const price = Number(formData.get("price"));
  const includes = normalizeIncludes(formData.get("includes"));

  await prisma.package.update({
    where: { id },
    data: { serviceId, name, packageType, price, includes, description: descriptionFor(level, packageType) }
  });
  await refreshPackageViews();
}

async function setPackageActive(formData: FormData) {
  "use server";
  const id = String(formData.get("id"));
  const active = String(formData.get("active")) === "true";
  await prisma.package.update({ where: { id }, data: { active } });
  await refreshPackageViews();
}

export default async function AdminPackagesPage() {
  const [services, packageRows] = await Promise.all([
    prisma.service.findMany({ orderBy: { name: "asc" } }),
    prisma.package.findMany({ include: { service: true }, orderBy: [{ packageType: "asc" }, { price: "asc" }] })
  ]);

  return (
    <div className="grid gap-6">
      <div>
        <h2 className="text-2xl font-black">Package Management</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Create, edit, activate, deactivate, and update Berwa Photo Hub package prices.</p>
      </div>

      <form action={createPackage} className="grid gap-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
        <h3 className="text-lg font-black">Create Package</h3>
        <div className="grid gap-4 md:grid-cols-2 mobile-stack">
          <input className="input" name="name" placeholder="Package title" required />
          <select className="input" name="level" defaultValue="">
            <option value="">Package level optional</option>
            {levels.map((level) => <option key={level}>{level}</option>)}
          </select>
          <select className="input" name="serviceId" required defaultValue={services.find((service) => service.name === "Event Coverage")?.id ?? services[0]?.id}>
            {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
          </select>
          <select className="input" name="packageType" required defaultValue="EVENT">
            {Object.values(PackageType).map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <input className="input" name="price" type="number" min="1" placeholder="Price in RWF" required />
        </div>
        <textarea className="input min-h-28" name="includes" placeholder={"One include per line\n1 hour of event coverage\n20 retouched professional pictures"} required />
        <button className="btn btn-primary w-fit">Create Package</button>
      </form>

      <div className="grid gap-4">
        {packageRows.map((item) => {
          const includes = Array.isArray(item.includes) ? item.includes.map(String).join("\n") : "";
          const level = levelFromDescription(item.description);
          return (
            <section key={item.id} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black">{item.name}</h3>
                  <p className="text-sm text-[var(--muted)]">{item.service.name} | {item.packageType} | {rwf(item.price.toString())} | {item.active ? "Active" : "Inactive"}</p>
                </div>
                <form action={setPackageActive}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="active" value={String(!item.active)} />
                  <button className={item.active ? "btn bg-black text-white" : "btn btn-gold"}>{item.active ? "Deactivate" : "Activate"}</button>
                </form>
              </div>
              <form action={updatePackage} className="grid gap-4">
                <input type="hidden" name="id" value={item.id} />
                <div className="grid gap-4 md:grid-cols-2 mobile-stack">
                  <input className="input" name="name" defaultValue={item.name} required />
                  <select className="input" name="level" defaultValue={level}>
                    <option value="">Package level optional</option>
                    {levels.map((entry) => <option key={entry}>{entry}</option>)}
                  </select>
                  <select className="input" name="serviceId" defaultValue={item.serviceId} required>
                    {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
                  </select>
                  <select className="input" name="packageType" defaultValue={item.packageType} required>
                    {Object.values(PackageType).map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <input className="input" name="price" type="number" min="1" defaultValue={Number(item.price)} required />
                </div>
                <textarea className="input min-h-28" name="includes" defaultValue={includes} required />
                <button className="btn btn-primary w-fit">Update Package</button>
              </form>
            </section>
          );
        })}
      </div>
    </div>
  );
}
