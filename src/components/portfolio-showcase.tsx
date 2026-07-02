"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Camera, Images, Sparkles } from "lucide-react";
import { portfolioCategories } from "@/lib/portfolio";

const features = [
  ["01", "Art", "Guided composition and careful color."],
  ["02", "Beauty", "Retouching that keeps the person natural."],
  ["03", "Marriage", "Wedding stories delivered with structure."]
];

export function PortfolioShowcase() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const selectedCategory = portfolioCategories[activeCategory];
  const selectedImage = selectedCategory.images[activeImage] ?? selectedCategory.images[0];

  const showCategory = (index: number) => {
    setActiveCategory(index);
    setActiveImage(0);
  };

  return (
    <section className="overflow-hidden bg-[#05070b] py-20 text-white">
      <div className="page-shell">
        <div className="grid gap-10 md:grid-cols-[0.85fr_1.15fr] mobile-stack">
          <div>
            <p className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[var(--gold)]">
              <Sparkles size={18} /> Portfolio
            </p>
            <h2 className="display-serif text-5xl leading-tight md:text-6xl">Our Work, shaped for memory.</h2>
            <p className="mt-5 max-w-md text-base leading-7 text-white/68">
              A studio blog should feel alive before anyone clicks a package. Explore real work across portraits, outdoor sessions, events, and wedding coverage.
            </p>
            <div className="mt-7 flex flex-wrap gap-2" aria-label="Portfolio categories">
              {portfolioCategories.map((category, index) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => showCategory(index)}
                  className={`rounded-full border px-4 py-2 text-sm font-black transition ${
                    activeCategory === index
                      ? "border-[var(--gold)] bg-[var(--gold)] text-black"
                      : "border-white/14 bg-white/5 text-white/75 hover:border-white/35 hover:text-white"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
            <div className="mt-8 grid gap-4">
              {features.map(([number, title, copy]) => (
                <article key={title} className="grid grid-cols-[3.5rem_1fr] gap-4 border-t border-white/12 pt-4">
                  <span className="display-serif text-3xl text-[var(--gold)]">{number}</span>
                  <span>
                    <span className="block text-lg font-black">{title}</span>
                    <span className="mt-1 block text-sm leading-6 text-white/62">{copy}</span>
                  </span>
                </article>
              ))}
            </div>
          </div>

          <div>
            <div className="relative min-h-[440px] overflow-hidden rounded-lg border border-white/12 bg-white/5">
              <img
                src={selectedImage}
                alt={`${selectedCategory.title} portfolio`}
                className="absolute inset-0 h-full w-full object-cover transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-[var(--gold)]">{selectedCategory.eyebrow}</p>
                <h3 className="display-serif mt-2 text-4xl">{selectedCategory.title}</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/72">{selectedCategory.copy}</p>
              </div>
              <div className="absolute right-5 top-5 grid h-20 w-20 place-items-center rounded-full border border-white/20 bg-black/30 text-center text-[10px] font-black uppercase tracking-[0.14em] text-white/80">
                Explore
              </div>
            </div>

            <div className="portfolio-rail mt-4 flex gap-3 overflow-x-auto pb-2" aria-label="Portfolio image selector">
              {selectedCategory.images.slice(0, 14).map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  onMouseEnter={() => setActiveImage(index)}
                  className={`group relative h-28 w-32 shrink-0 overflow-hidden rounded-lg border transition ${
                    activeImage === index ? "border-[var(--gold)]" : "border-white/12"
                  }`}
                  aria-label={`Show ${selectedCategory.label} image ${index + 1}`}
                >
                  <img src={image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <span className="absolute inset-0 bg-black/20" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/12 pt-6">
          <div className="flex flex-wrap gap-3 text-sm font-bold text-white/72">
            <span className="inline-flex items-center gap-2"><Camera size={18} className="text-[var(--gold)]" /> Studio portraits</span>
            <span className="inline-flex items-center gap-2"><Images size={18} className="text-[var(--gold)]" /> Outdoor and wedding stories</span>
          </div>
          <Link href="/gallery" className="btn btn-gold">
            View Gallery <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
