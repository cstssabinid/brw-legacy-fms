import Link from "next/link";
import { ClientFeedback } from "@/components/client-feedback";
import { LandingSlider } from "@/components/landing-slider";
import { PackageCard } from "@/components/package-card";
import { PortfolioShowcase } from "@/components/portfolio-showcase";
import { WeddingContractModal } from "@/components/wedding-contract-modal";
import { getActiveCatalogPackages, getActiveServices, packagesByType } from "@/lib/catalog";
import { portfolioCategories } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

const eventPackageImages = portfolioCategories.find((category) => category.id === "events")?.images ?? [];
const eventPackageImageOrder = [2, 6, 4, 7, 1, 5, 0, 3];

export default async function HomePage() {
  const [services, catalogPackages] = await Promise.all([getActiveServices(), getActiveCatalogPackages()]);
  const packages = packagesByType(catalogPackages);
  return (
    <main>
      <LandingSlider />

      <PortfolioShowcase />

      <section className="page-shell py-16" id="services">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-black text-[var(--gold)]">Services</p>
            <h2 className="text-3xl font-black">Berwa Photo Hub</h2>
          </div>
          <Link href="/services" className="font-bold text-[var(--navy)] dark:text-[var(--gold)]">View all services</Link>
        </div>
        <div className="responsive-grid">
          {services.slice(0, 12).map((service) => <article className="card p-4 font-bold transition hover:-translate-y-1" key={service}>{service}</article>)}
        </div>
      </section>

      <section className="bg-[var(--navy)] py-16 text-white">
        <div className="page-shell">
          <h2 className="mb-8 text-3xl font-black">Featured Packages</h2>
          <div className="responsive-grid">
            {packages.indoor.map((item, index) => (
              <PackageCard
                key={`indoor-${item.name}`}
                item={item}
                category="Indoor"
                imageSrc={`/studio-blog/indoor-package-${index + 1}.jpg`}
                premium={item.name === "GOLD"}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="page-shell py-16">
        <ClientFeedback />
      </section>

      <section className="page-shell py-16">
        <h2 className="mb-8 text-3xl font-black">Event Coverage Packages</h2>
        <div className="responsive-grid">
          {packages.event.map((item, index) => (
            <PackageCard
              key={item.name}
              item={item}
              category="Event"
              imageSrc={eventPackageImages[eventPackageImageOrder[index % eventPackageImageOrder.length]]}
              premium={item.level === "Platinum"}
            />
          ))}
        </div>
      </section>

      <section className="page-shell py-16">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-3xl font-black">Wedding Packages</h2>
          <WeddingContractModal />
        </div>
        <div className="responsive-grid">
          {packages.wedding.map((item, index) => (
            <PackageCard
              key={item.name}
              item={item}
              category="Wedding"
              imageSrc={`/studio-blog/wedding-package-${index + 1}.jpg`}
              premium={item.name.includes("PREMIUM")}
            />
          ))}
        </div>
      </section>

    </main>
  );
}
