"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarCheck, MessageCircle, Sparkles } from "lucide-react";
import { brand } from "@/lib/brand";

const slides = [
  {
    image: "/studio-blog/landing%20page.jpg",
    eyebrow: "Studio High Vibe",
    title: "Own Your Spotlight",
    copy: "Bold energy, polished light, and a studio set made for portraits that turn heads.",
    cta: "Book Studio Session"
  },
  {
    image: "/studio-blog/berwa_photo_hub_18.jpg",
    eyebrow: "Portrait Highlights",
    title: "Authentic Studio Portraits",
    copy: "Natural expressions and professional lighting for headshots and personal portraits.",
    cta: "Book Studio Session"
  },
  {
    image: "/studio-blog/berwa_photo_hub_215.jpg",
    eyebrow: "Event Moments",
    title: "Joyful Celebrations",
    copy: "Vibrant event coverage capturing candid and group moments.",
    cta: "View Event Packages"
  },
  {
    image: "/studio-blog/berwa_photo_hub_228.jpg",
    eyebrow: "Ceremony Details",
    title: "Elegant Wedding Coverage",
    copy: "Candid and styled moments from preparation through reception.",
    cta: "View Wedding Packages"
  },
  {
    image: "/studio-blog/berwa_photo_hub_231.jpg",
    eyebrow: "Portrait Sessions",
    title: "Professional Studio Stories",
    copy: "Clean, polished portraits designed to reflect your personality.",
    cta: "Book Studio Session"
  },
  {
    image: "/studio-blog/berwa_photo_hub_362.jpg",
    eyebrow: "Wedding Ceremonies",
    title: "Timeless Moments",
    copy: "Elegant storytelling for your most important day.",
    cta: "View Wedding Packages"
  },
  {
    image: "/studio-blog/berwa_photo_hub_366.jpg",
    eyebrow: "Group Celebrations",
    title: "Vibrant Event Coverage",
    copy: "Capture the energy of every gathering with lively, colorful imagery.",
    cta: "View Event Packages"
  }
];

export function LandingSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

  function move(direction: number) {
    setActive((current) => (current + direction + slides.length) % slides.length);
  }

  const slide = slides[active];
  const slideNumber = String(active + 1).padStart(2, "0");
  const slideTotal = String(slides.length).padStart(2, "0");

  return (
    <section className="landing-hero relative min-h-[92vh] overflow-hidden bg-[#05070b] text-white">
      <div className="absolute inset-0">
        {slides.map((item, index) => (
          <img
            key={item.image}
            src={item.image}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition duration-1000 ${
              index === active ? "hero-slide-active opacity-100" : "scale-[1.08] opacity-0"
            }`}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/68 to-black/18" />
      <div className="absolute inset-y-0 right-0 hidden w-1/4 border-l border-white/10 bg-black/10 backdrop-blur-[1px] lg:block" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#05070b] to-transparent" />

      <div className="landing-hero-inner page-shell relative flex min-h-[92vh] flex-col justify-center py-20">
        <div className="max-w-4xl">
          <p className="landing-hero-eyebrow mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-[var(--gold)]">
            <Sparkles size={18} /> {slide.eyebrow}
          </p>
          <h1 className="landing-hero-title display-serif text-6xl leading-[0.95] md:text-8xl">{slide.title}</h1>
          <p className="landing-hero-copy mt-6 max-w-2xl text-xl leading-8 text-white/82">{slide.copy}</p>
          <div className="landing-hero-actions mt-8 flex flex-wrap gap-3">
            <Link className="btn btn-gold" href={slide.cta.includes("Wedding") ? "/wedding" : "/booking"}>
              <CalendarCheck size={18} /> {slide.cta}
            </Link>
            <a className="btn border-white/30 bg-white/10 text-white" href={brand.whatsappCatalog}>
              <MessageCircle size={18} /> WhatsApp Catalog
            </a>
          </div>
        </div>

        <div className="absolute right-0 top-28 hidden max-w-56 text-right lg:block">
          <p className="display-serif text-6xl text-white/18">{slideNumber}</p>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.2em] text-white/52">of {slideTotal}</p>
          <p className="mt-5 text-sm leading-6 text-white/62">Portraits, weddings, outdoor stories, and polished visual services in Kigali.</p>
        </div>

        <div className="absolute bottom-8 left-0 right-0">
          <div className="page-shell flex flex-wrap items-center justify-between gap-4 px-0">
            <div className="flex gap-2" aria-label="Choose landing slide">
              {slides.map((item, index) => (
                <button
                  key={item.image}
                  type="button"
                  className={`h-2.5 rounded-full transition-all ${
                    index === active ? "w-10 bg-[var(--gold)]" : "w-2.5 bg-white/45 hover:bg-white/75"
                  }`}
                  onClick={() => setActive(index)}
                  aria-label={`Show slide ${index + 1}`}
                  aria-current={index === active}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                className="btn aspect-square w-11 border-white/25 bg-white/10 p-0 text-white"
                type="button"
                onClick={() => move(-1)}
                aria-label="Previous landing image"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                className="btn btn-gold aspect-square w-11 p-0"
                type="button"
                onClick={() => move(1)}
                aria-label="Next landing image"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
