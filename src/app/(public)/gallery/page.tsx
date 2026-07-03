import { portfolioCategories } from "@/lib/portfolio";

const galleryImages = portfolioCategories.flatMap((category, categoryIndex) =>
  category.images.map((image, index) => ({
    category,
    image,
    span: index === 0 ? "lg:col-span-3 lg:row-span-2" : categoryIndex % 2 === 0 ? "lg:col-span-3 lg:row-span-1" : "lg:col-span-2 lg:row-span-1"
  }))
);

export default function GalleryPage() {
  return (
    <main className="bg-[#031f20] text-white">
      <div className="page-shell py-16 text-center md:py-24">
        <p className="font-black uppercase tracking-[0.2em] text-white/78">Image Gallery</p>
        <h1 className="mt-5 text-6xl font-black leading-none md:text-8xl">Our Work</h1>
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-3">
          {portfolioCategories.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              className="rounded-full border border-white/18 px-4 py-2 text-sm font-black text-white/82 transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
            >
              {category.label}
            </a>
          ))}
        </div>
      </div>

      <section className="grid auto-rows-[190px] grid-cols-1 gap-2 bg-[#031f20] px-2 pb-2 sm:grid-cols-2 md:auto-rows-[220px] lg:grid-cols-12">
        {galleryImages.map((item, index) => (
          <article
            key={`${item.image}-${index}`}
            className={`group relative min-h-[230px] overflow-hidden bg-black sm:min-h-0 ${item.span}`}
          >
            <img
              src={item.image}
              alt={`${item.category.label} ${index + 1}`}
              loading={index > 8 ? "lazy" : "eager"}
              className="h-full w-full object-cover object-[center_28%] transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
            <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--gold)]">{item.category.eyebrow}</p>
              <h2 className="mt-1 text-xl font-black">{item.category.title}</h2>
            </div>
          </article>
        ))}
      </section>

      <div className="page-shell space-y-14 py-16">
        {portfolioCategories.map((category) => (
          <section key={category.id} id={category.id} aria-labelledby={`${category.id}-title`}>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--border)] pb-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--gold)]">{category.eyebrow}</p>
                <h2 id={`${category.id}-title`} className="mt-1 text-3xl font-black md:text-4xl">{category.title}</h2>
              </div>
              <p className="text-sm font-bold text-white/62">{category.images.length} images</p>
            </div>
            <div className="grid auto-rows-[220px] grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {category.images.slice(0, 8).map((image, index) => (
                <article
                  key={image}
                  className={`group relative overflow-hidden bg-black ${index % 5 === 0 ? "lg:row-span-2" : ""}`}
                >
                  <img
                    src={image}
                    alt={`${category.label} ${index + 1}`}
                    loading={index > 5 ? "lazy" : "eager"}
                    className="h-full w-full object-cover object-[center_28%] transition duration-700 group-hover:scale-105"
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
