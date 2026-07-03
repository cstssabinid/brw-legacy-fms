import { PackageCard } from "@/components/package-card";
import { getActiveCatalogPackages, getActiveServices, packagesByType } from "@/lib/catalog";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const [services, catalogPackages] = await Promise.all([getActiveServices(), getActiveCatalogPackages()]);
  const grouped = packagesByType(catalogPackages);
  return (
    <main className="page-shell py-12">
      <h1 className="text-4xl font-black">Services</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">Photography, design, printing, papeterie, online applications and company service income are tracked inside the financial system.</p>
      <div className="responsive-grid mt-8">
        {services.map((service) => (
          <Link key={service} className="card block p-5 font-bold" href={`/booking?service=${encodeURIComponent(service)}`}>
            {service}
            <span className="mt-3 block text-sm font-semibold text-[var(--muted)]">Request this service</span>
          </Link>
        ))}
      </div>
      <section className="mt-12">
        <h2 className="mb-5 text-2xl font-black">Event Coverage Packages</h2>
        <div className="responsive-grid">
          {grouped.event.map((item) => (
            <PackageCard
              key={item.name}
              item={item}
              category="Event"
              imageSrc="/brand/outdoor-placeholder.svg"
              premium={item.level === "Platinum"}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
