import { ClientFeedback } from "@/components/client-feedback";
import { PackageCard } from "@/components/package-card";
import { brand } from "@/lib/brand";
import { getActiveCatalogPackages, packagesByType } from "@/lib/catalog";
import { portfolioCategories } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

const eventPackageImages = portfolioCategories.find((category) => category.id === "events")?.images ?? [];
const eventPackageImageOrder = [2, 6, 4, 7, 1, 5, 0, 3];

export default async function PackagesPage() {
  const grouped = packagesByType(await getActiveCatalogPackages());
  return (
    <main className="page-shell py-12">
      <div className="mb-10 max-w-3xl">
        <p className="font-black text-[var(--gold)]">Studio Blog</p>
        <h1 className="mt-2 text-4xl font-black">Berwa Photo Hub</h1>
        <p className="mt-4 text-[var(--muted)]">{brand.slogan}</p>
      </div>

      <section>
        <h2 className="mb-5 text-2xl font-black">Indoor</h2>
        <div className="responsive-grid">
          {grouped.indoor.map((item, index) => (
            <PackageCard
              key={`i-${item.name}`}
              item={item}
              category="Indoor"
              imageSrc={`/studio-blog/indoor-package-${index + 1}.jpg`}
              premium={item.name === "GOLD"}
            />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-5 text-2xl font-black">Outdoor</h2>
        <div className="responsive-grid">
          {grouped.outdoor.map((item, index) => (
            <PackageCard
              key={`o-${item.name}`}
              item={item}
              category="Outdoor"
              imageSrc={`/studio-blog/outdoor-package-${index + 1}.jpg`}
              premium={item.name === "GOLD"}
            />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-5 text-2xl font-black">Event Coverage Packages</h2>
        <div className="responsive-grid">
          {grouped.event.map((item, index) => (
            <PackageCard
              key={`e-${item.name}`}
              item={item}
              category="Event"
              imageSrc={eventPackageImages[eventPackageImageOrder[index % eventPackageImageOrder.length]]}
              premium={item.level === "Platinum"}
            />
          ))}
        </div>
      </section>

      <section className="mt-14">
        <ClientFeedback />
      </section>
    </main>
  );
}
