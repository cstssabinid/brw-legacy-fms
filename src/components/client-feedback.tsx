"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Quote, Star } from "lucide-react";

const feedback = [
  {
    name: "Aline M.",
    session: "Indoor Gold Session",
    quote: "The team guided every pose and the final retouched photos looked polished without losing my natural look.",
    image: "/studio-blog/client-feedback-1.jpg"
  },
  {
    name: "Kevin N.",
    session: "Outdoor Silver Session",
    quote: "They helped us choose the location, kept time well, and delivered photos we could use for family and business profiles.",
    image: "/studio-blog/client-feedback-2.jpg"
  },
  {
    name: "Grace U.",
    session: "Wedding Coverage",
    quote: "Our album, highlight video, and online gallery were organized beautifully. The booking process was simple from start to finish.",
    image: "/studio-blog/client-feedback-3.jpg"
  }
];

export function ClientFeedback() {
  const [active, setActive] = useState(0);
  const item = feedback[active];

  function move(direction: number) {
    setActive((current) => (current + direction + feedback.length) % feedback.length);
  }

  return (
    <section className="grid gap-6 md:grid-cols-[0.9fr_1.1fr] mobile-stack">
      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[#05070b]">
        <img src={item.image} alt={`${item.name} feedback`} className="h-full min-h-80 w-full object-cover" onError={(event) => { event.currentTarget.src = "/brand/studio-placeholder.svg"; }} />
      </div>
      <div className="card flex min-h-80 flex-col justify-between p-6">
        <div>
          <div className="flex items-center justify-between gap-4">
            <p className="font-black text-[var(--gold)]">Client Feedback</p>
            <Quote className="text-[var(--gold)]" size={30} />
          </div>
          <div className="mt-5 flex gap-1 text-[var(--gold)]">
            {Array.from({ length: 5 }).map((_, index) => <Star key={index} size={18} fill="currentColor" />)}
          </div>
          <p className="mt-6 text-2xl font-black leading-snug">{item.quote}</p>
        </div>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-lg font-black">{item.name}</h3>
            <p className="text-sm text-[var(--muted)]">{item.session}</p>
          </div>
          <div className="flex gap-2">
            <button className="btn card aspect-square w-11 p-0" type="button" onClick={() => move(-1)} aria-label="Previous feedback"><ArrowLeft size={18} /></button>
            <button className="btn btn-primary aspect-square w-11 p-0" type="button" onClick={() => move(1)} aria-label="Next feedback"><ArrowRight size={18} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
