"use client";

import { FormEvent } from "react";
import { Mail, MessageCircle, Send, X } from "lucide-react";
import { brand } from "@/lib/brand";

type ContactModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ContactModal({ open, onClose }: ContactModalProps) {
  if (!open) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "");
    const email = String(form.get("email") ?? "");
    const phone = String(form.get("phone") ?? "");
    const service = String(form.get("service") ?? "");
    const date = String(form.get("date") ?? "");
    const location = String(form.get("location") ?? "");
    const subject = String(form.get("subject") ?? "");
    const message = String(form.get("message") ?? "");
    const reply = String(form.get("reply") ?? "");

    const body = [
      `Full name: ${name}`,
      `Email: ${email}`,
      `Phone / WhatsApp: ${phone}`,
      `Service needed: ${service}`,
      `Preferred date: ${date || "Not specified"}`,
      `Location: ${location || "Not specified"}`,
      `Preferred reply: ${reply}`,
      "",
      message
    ].join("\n");

    window.location.href = `mailto:${brand.email}?subject=${encodeURIComponent(subject || "New Berwa Photo Hub contact request")}&body=${encodeURIComponent(body)}`;
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 py-8 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="contact-modal-title">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[var(--gold)]">Contact us</p>
            <h2 id="contact-modal-title" className="display-serif mt-2 text-4xl leading-tight">Write to Berwa Photo Hub</h2>
          </div>
          <button className="btn aspect-square w-11 border border-[var(--border)] p-0" type="button" onClick={onClose} aria-label="Close contact form">
            <X size={20} />
          </button>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2 mobile-stack">
            <label className="grid gap-2 text-sm font-bold">
              Full name
              <input className="input" name="name" required placeholder="Your name" />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Email
              <input className="input" name="email" type="email" required placeholder="you@example.com" />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mobile-stack">
            <label className="grid gap-2 text-sm font-bold">
              Phone / WhatsApp
              <input className="input" name="phone" required placeholder="+250 ..." />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Service needed
              <select className="input" name="service" required defaultValue="">
                <option value="" disabled>Select service</option>
                <option>Studio portrait session</option>
                <option>Outdoor photography</option>
                <option>Wedding coverage</option>
                <option>Event Coverage</option>
                <option>Graphic design / printing</option>
                <option>Online services</option>
                <option>Other</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mobile-stack">
            <label className="grid gap-2 text-sm font-bold">
              Subject
              <input className="input" name="subject" required placeholder="How can we help?" />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Preferred reply
              <select className="input" name="reply" required defaultValue="WhatsApp">
                <option>WhatsApp</option>
                <option>Email</option>
                <option>Phone call</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mobile-stack">
            <label className="grid gap-2 text-sm font-bold">
              Preferred date
              <input className="input" name="date" type="date" />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Location
              <input className="input" name="location" placeholder="Studio, Kigali venue, or online" />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-bold">
            Message
            <textarea className="input min-h-32 resize-y" name="message" required placeholder="Share the date, location, package, or details you have in mind." />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap gap-2">
              <a className="btn border border-[var(--border)]" href={`mailto:${brand.email}`}>
                <Mail size={18} /> Email
              </a>
              <a className="btn border border-[var(--border)]" href={brand.whatsappDirect} target="_blank" rel="noreferrer">
                <MessageCircle size={18} /> WhatsApp
              </a>
            </div>
            <button className="btn btn-gold" type="submit">
              <Send size={18} /> Send Message
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
