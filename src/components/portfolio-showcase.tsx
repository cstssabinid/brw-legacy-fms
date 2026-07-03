"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Images, Sparkles, X } from "lucide-react";
import { portfolioCategories, type PortfolioCategory } from "@/lib/portfolio";

type ModalState = {
  category: PortfolioCategory;
  imageIndex: number;
} | null;

export function PortfolioShowcase() {
  return <PortfolioSection />;
}

export function PortfolioSection() {
  const [modal, setModal] = useState<ModalState>(null);
  return (
    <section className="overflow-hidden bg-[#05070b] py-16 text-white md:py-20">
      <div className="page-shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[var(--gold)]">
            <Sparkles size={18} /> Portfolio
          </p>
          <h2 className="display-serif text-4xl leading-tight md:text-6xl">Explore Our Work by Category</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/68">
            From studio portraits to weddings, every session is organized so clients can quickly find the style that fits their moment.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-6 lg:grid-cols-2">
          {portfolioCategories.map((category, index) => (
            <PortfolioCard key={category.id} category={category} index={index} onOpen={(imageIndex) => setModal({ category, imageIndex })} />
          ))}
        </div>
      </div>
      <PortfolioModal modal={modal} onClose={() => setModal(null)} onChange={setModal} />
    </section>
  );
}

export function PortfolioCard({ category, index, onOpen }: { category: PortfolioCategory; index: number; onOpen: (imageIndex: number) => void }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % category.images.length);
    }, 4200 + index * 350);

    return () => window.clearInterval(timer);
  }, [category.images.length, index, paused]);

  function moveImage(direction: number) {
    setActive((current) => (current + direction + category.images.length) % category.images.length);
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileTap={{ scale: 0.985 }}
      className="group relative h-[380px] overflow-hidden rounded-lg border border-white/12 bg-black shadow-2xl shadow-black/25 transition duration-300 hover:-translate-y-1 hover:border-[var(--gold)] hover:shadow-[0_24px_70px_rgba(0,0,0,0.42)] md:h-[460px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onClick={() => onOpen(active)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(active);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open ${category.title} gallery`}
    >
      <PortfolioImageSlider category={category} active={active} />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black via-black/42 to-black/14" />
      <div className="absolute left-5 right-5 top-5 z-20 flex items-center justify-between gap-3">
        <span className="rounded-full border border-[var(--gold)]/45 bg-black/38 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-[var(--gold)] backdrop-blur">
          {category.shortTitle}
        </span>
      </div>
      <div className="absolute inset-x-5 bottom-5 z-20">
        <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-white/24" aria-hidden="true">
          <span className="block h-full rounded-full bg-[var(--gold)] transition-all duration-700" style={{ width: `${((active + 1) / category.images.length) * 100}%` }} />
        </div>
        <h3 className="display-serif text-3xl leading-none text-white">{category.title}</h3>
        <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/76">{category.description}</p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <button className="btn btn-gold relative z-30 px-4 py-2 text-sm" type="button" onClick={(event) => { event.stopPropagation(); onOpen(active); }}>
            {category.cta} <ArrowRight size={16} />
          </button>
          <div className="relative z-30 flex gap-2">
            <button className="grid h-10 w-10 place-items-center rounded-full border border-white/18 bg-black/32 text-white transition hover:border-[var(--gold)] hover:text-[var(--gold)]" type="button" onClick={(event) => { event.stopPropagation(); moveImage(-1); }} aria-label={`Previous ${category.title} image`}>
              <ChevronLeft size={18} />
            </button>
            <button className="grid h-10 w-10 place-items-center rounded-full border border-white/18 bg-black/32 text-white transition hover:border-[var(--gold)] hover:text-[var(--gold)]" type="button" onClick={(event) => { event.stopPropagation(); moveImage(1); }} aria-label={`Next ${category.title} image`}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
      <span className="absolute inset-x-0 top-0 z-20 h-1 origin-left scale-x-0 bg-[var(--gold)] transition duration-300 group-hover:scale-x-100" />
    </motion.article>
  );
}

export function PortfolioImageSlider({ category, active }: { category: PortfolioCategory; active: number }) {
  return (
    <div className="absolute inset-0">
      {category.images.map((image, index) => (
        <img
          key={image}
          src={image}
          alt={`${category.title} portfolio ${index + 1}`}
          loading={index === 0 ? "eager" : "lazy"}
          className={`absolute inset-0 h-full w-full object-cover object-[center_24%] transition duration-1000 group-hover:scale-105 ${
            index === active ? "opacity-100" : "scale-[1.05] opacity-0"
          }`}
          onError={(event) => { event.currentTarget.src = "/studio-blog/indoor-package-1.jpg"; }}
        />
      ))}
    </div>
  );
}

export function PortfolioModal({ modal, onClose, onChange }: { modal: ModalState; onClose: () => void; onChange: (modal: ModalState) => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const category = modal?.category;
  const imageIndex = modal?.imageIndex ?? 0;
  const image = category?.images[imageIndex];

  useEffect(() => {
    if (!modal) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modal, onClose]);

  function move(direction: number) {
    if (!category) return;
    onChange({ category, imageIndex: (imageIndex + direction + category.images.length) % category.images.length });
  }

  return (
    <AnimatePresence>
      {modal && category && image && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/82 p-4 text-white backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${category.title} gallery`}
        >
          <motion.div
            className="relative grid max-h-[92vh] w-full max-w-6xl gap-4 overflow-hidden rounded-lg border border-white/14 bg-[#05070b] p-4 shadow-2xl md:grid-cols-[minmax(0,1fr)_15rem]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button ref={closeButtonRef} className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full bg-black/62 text-white transition hover:bg-[var(--gold)] hover:text-black" type="button" onClick={onClose} aria-label="Close portfolio gallery">
              <X size={20} />
            </button>
            <div className="relative flex max-h-[74vh] items-center justify-center overflow-hidden rounded-lg bg-[#08090d]">
              <img src={image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-18 blur-2xl" />
              <img src={image} alt={`${category.title} enlarged ${imageIndex + 1}`} className="relative z-10 h-auto max-h-[74vh] w-auto max-w-full rounded-md object-contain" />
              <button className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white transition hover:bg-[var(--gold)] hover:text-black" type="button" onClick={() => move(-1)} aria-label="Previous portfolio image">
                <ChevronLeft size={22} />
              </button>
              <button className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white transition hover:bg-[var(--gold)] hover:text-black" type="button" onClick={() => move(1)} aria-label="Next portfolio image">
                <ChevronRight size={22} />
              </button>
            </div>
            <aside className="grid content-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--gold)]">{category.eyebrow}</p>
                <h3 className="display-serif mt-2 text-3xl">{category.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/68">{category.description}</p>
              </div>
              <div className="portfolio-rail grid max-h-48 grid-cols-4 gap-2 overflow-y-auto md:max-h-none md:grid-cols-2">
                {category.images.map((thumbnail, index) => (
                  <button key={thumbnail} type="button" onClick={() => onChange({ category, imageIndex: index })} className={`relative aspect-square overflow-hidden rounded-md border ${index === imageIndex ? "border-[var(--gold)]" : "border-white/12"}`} aria-label={`Open ${category.title} thumbnail ${index + 1}`}>
                    <img src={thumbnail} alt="" className="h-full w-full object-cover" />
                    <span className={`absolute inset-0 ${index === imageIndex ? "bg-transparent" : "bg-black/34"}`} />
                  </button>
                ))}
              </div>
            </aside>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
