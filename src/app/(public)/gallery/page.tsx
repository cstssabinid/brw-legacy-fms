import { GalleryLightboxTile, type GalleryLightboxImage } from "@/components/gallery-lightbox";
import { portfolioCategories } from "@/lib/portfolio";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const galleryImages = portfolioCategories.flatMap((category, categoryIndex) =>
  category.images.map((image, index) => ({
    category,
    image,
    alt: `${category.label} ${index + 1}`,
    span: index === 0 ? "lg:col-span-3 lg:row-span-2" : categoryIndex % 2 === 0 ? "lg:col-span-3 lg:row-span-1" : "lg:col-span-2 lg:row-span-1"
  }))
);

const lightboxImages: GalleryLightboxImage[] = galleryImages.map((item) => ({
  src: item.image,
  alt: item.alt,
  eyebrow: item.category.eyebrow,
  title: item.category.title
}));

export default async function GalleryPage() {
  const uploadedImages = await prisma.galleryImage.findMany({ where: { active: true }, orderBy: { createdAt: "desc" } });
  const uploadedLightboxImages: GalleryLightboxImage[] = uploadedImages.map((entry) => ({ src: entry.imageUrl, alt: entry.title, eyebrow: entry.category, title: entry.title }));
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
          <GalleryLightboxTile
            key={`${item.image}-${index}`}
            image={{
              src: item.image,
              alt: item.alt,
              eyebrow: item.category.eyebrow,
              title: item.category.title
            }}
            images={lightboxImages}
            className={`group relative min-h-[230px] overflow-hidden bg-black sm:min-h-0 ${item.span}`}
          >
            <img
              src={item.image}
              alt={item.alt}
              loading={index > 8 ? "lazy" : "eager"}
              className="h-full w-full object-cover object-[center_28%] transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
            <div className="absolute bottom-4 left-4 right-4 translate-y-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--gold)]">{item.category.eyebrow}</p>
              <h2 className="mt-1 text-xl font-black">{item.category.title}</h2>
            </div>
          </GalleryLightboxTile>
        ))}
      </section>

      {uploadedImages.length > 0 && <section className="page-shell py-14">
        <div className="mb-5 border-b border-white/15 pb-4">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--gold)]">Latest work</p>
          <h2 className="mt-1 text-3xl font-black md:text-4xl">Studio Gallery</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {uploadedImages.map((item, index) => {
            const image = uploadedLightboxImages[index];
            return <GalleryLightboxTile key={item.id} image={image} images={uploadedLightboxImages} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-black">
              <img src={item.imageUrl} alt={item.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4"><p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--gold)]">{item.category}</p><h3 className="mt-1 text-xl font-black">{item.title}</h3>{item.description && <p className="mt-1 line-clamp-2 text-sm text-white/75">{item.description}</p>}</div>
            </GalleryLightboxTile>;
          })}
        </div>
      </section>}

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
                <GalleryLightboxTile
                  key={image}
                  image={{
                    src: image,
                    alt: `${category.label} ${index + 1}`,
                    eyebrow: category.eyebrow,
                    title: category.title
                  }}
                  images={lightboxImages}
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
                </GalleryLightboxTile>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
