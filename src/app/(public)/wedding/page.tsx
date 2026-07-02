import { PackageCard } from "@/components/package-card";
import { WeddingContractModal } from "@/components/wedding-contract-modal";
import { packages } from "@/lib/brand";

export default function WeddingPage() {
  return (
    <main className="page-shell py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-4xl font-black">Wedding Photography Packages</h1>
        <WeddingContractModal />
      </div>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">Full coverage packages with album, video, frames, online gallery, makeup options and premium add-ons.</p>
      <div className="responsive-grid mt-8">
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
    </main>
  );
}
