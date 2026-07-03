"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Camera, Quote, Star } from "lucide-react";

type FeedbackItem = {
  name: string;
  session: string;
  quote: string;
  image: string;
};

const defaultFeedback: FeedbackItem[] = [
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
  const [clientFeedback, setClientFeedback] = useState<FeedbackItem[]>([]);
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState("");
  const [posting, setPosting] = useState(false);
  const feedback = useMemo(() => [...defaultFeedback, ...clientFeedback], [clientFeedback]);
  const item = feedback[active] ?? feedback[0];

  useEffect(() => {
    fetch("/api/feedback")
      .then((response) => response.json())
      .then((data) => setClientFeedback(Array.isArray(data.feedback) ? data.feedback : []))
      .catch(() => setClientFeedback([]));
  }, []);

  function move(direction: number) {
    setActive((current) => (current + direction + feedback.length) % feedback.length);
  }

  function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setPreview("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const quote = String(form.get("quote") ?? "").trim();
    if (!quote || !preview) return;

    setPosting(true);
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? "").trim(),
        session: String(form.get("session") ?? "").trim(),
        quote,
        image: preview
      })
    });
    const data = await res.json();
    setPosting(false);
    if (!res.ok) return;

    const next = Array.isArray(data.feedback) ? data.feedback : [{
      name: String(form.get("name") ?? "").trim() || "Client",
      session: String(form.get("session") ?? "").trim() || "Berwa Photo Hub service",
      quote,
      image: preview
    }];
    setClientFeedback(next);
    setActive(defaultFeedback.length);
    setPreview("");
    event.currentTarget.reset();
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] mobile-stack">
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
      <form className="card grid gap-4 p-5 lg:col-span-2" onSubmit={submit}>
        <div className="grid gap-4 md:grid-cols-[1fr_1fr_1.2fr] mobile-stack">
          <input className="input" name="name" placeholder="Your name" />
          <input className="input" name="session" placeholder="Service received" />
          <label className="btn card min-h-12 cursor-pointer justify-start">
            <Camera size={18} />
            <span>{preview ? "Picture selected" : "Add feedback picture"}</span>
            <input className="sr-only" type="file" accept="image/*" onChange={handleImage} required />
          </label>
        </div>
        <textarea className="input min-h-24" name="quote" placeholder="Write your comment" required />
        {preview && <img src={preview} alt="Feedback preview" className="h-28 w-28 rounded-lg border border-[var(--border)] object-cover" />}
        <button className="btn btn-primary w-full md:w-fit" type="submit" disabled={posting}>{posting ? "Posting..." : "Post Feedback"}</button>
      </form>
    </section>
  );
}
