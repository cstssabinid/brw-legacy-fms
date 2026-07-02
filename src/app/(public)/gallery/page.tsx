import { portfolioCategories } from "@/lib/portfolio";

export default function GalleryPage() {
  return (
    <main className="page-shell py-12">
      <div className="max-w-3xl">
        <p className="font-black uppercase tracking-[0.18em] text-[var(--gold)]">Portfolio</p>
        <h1 className="display-serif mt-3 text-5xl leading-tight md:text-6xl">Gallery of crafted memories</h1>
        <p className="mt-4 text-lg leading-8 text-[var(--muted)]">
          Studio portraits, outdoor stories, event moments, and wedding coverage from Berwa Photo Hub.
        </p>
      </div>
      <div className="mt-10 space-y-14">
        {portfolioCategories.map((category) => (
          <section key={category.id} aria-labelledby={`${category.id}-title`}>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border)] pb-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--gold)]">{category.eyebrow}</p>
                <h2 id={`${category.id}-title`} className="display-serif mt-1 text-3xl md:text-4xl">{category.title}</h2>
              </div>
              <p className="text-sm font-bold text-[var(--muted)]">{category.images.length} images</p>
            </div>
            <div className="grid auto-rows-[230px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.images.map((image, index) => (
                <article
                  key={image}
                  className={`group relative overflow-hidden rounded-lg border border-[var(--border)] bg-[#05070b] ${
                    index % 7 === 0 ? "lg:row-span-2" : ""
                  }`}
                >
                  <img
                    src={image}
                    alt={`${category.label} ${index + 1}`}
                    loading={index > 5 ? "lazy" : "eager"}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent opacity-75" />
                  <h3 className="absolute bottom-4 left-4 right-4 text-lg font-black text-white">
                    {category.label} {index + 1}
                  </h3>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
