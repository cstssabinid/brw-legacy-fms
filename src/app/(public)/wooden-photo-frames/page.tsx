import Link from "next/link";
import { ArrowRight, Check, Layers, Paintbrush, Sparkles } from "lucide-react";
import { brand } from "@/lib/brand";

export const metadata = {
  title: "Wooden Photo Frames | Berwa Photo Hub",
  description: "Create custom wooden photo frames and photo prints on wood boards with Berwa Photo Hub. Perfect for gifts, home décor, weddings and corporate displays."
};

const frameBenefits = [
  "Custom wood board sizes for wall art and shelf display",
  "High-resolution photo printing with vivid color and deep contrast",
  "Durable laminated finish for long-lasting family memories",
  "Delivered ready for hanging or gift presentation"
];

const frameSteps = [
  { title: "Choose your design", description: "Send us your favorite image or select from your shoot gallery." },
  { title: "Pick wood finish", description: "Select from natural oak, dark walnut, or premium matte coated wood." },
  { title: "Confirm size", description: "We’ll recommend a size for home décor, wedding gifts, or corporate displays." },
  { title: "Receive your order", description: "Your wooden photo board is finished and packaged for safe delivery." }
];

const sizes = [
  { label: "Small", value: "20 x 30 cm", price: "15,000 RWF" },
  { label: "Medium", value: "30 x 40 cm", price: "25,000 RWF" },
  { label: "Large", value: "40 x 60 cm", price: "40,000 RWF" }
];

export default function WoodenPhotoFramesPage() {
  return (
    <main className="page-shell py-16">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-center gap-6">
          <p className="font-black uppercase tracking-[0.2em] text-[var(--gold)]">Wooden Photo Frames</p>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.02]">Photo Frames on Wood Boards for Your Home, Gifts, and Special Moments</h1>
          <p className="max-w-2xl text-lg text-[var(--muted)]">Berwa Photo Hub turns your best photographs into custom wooden board portraits and wall art. Each piece is printed on premium wood, finished for display, and delivered ready to give or hang.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/booking?service=Frames%20/%20Cadres" className="btn btn-primary inline-flex items-center gap-2">Order Wooden Frames <ArrowRight size={18} /></Link>
            <a href={brand.whatsappDirect} target="_blank" rel="noreferrer" className="btn btn-gold inline-flex items-center gap-2">Chat on WhatsApp</a>
          </div>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-[var(--border)] bg-[#04060d] shadow-2xl shadow-black/20">
          <img src="/studio-blog/wedding-package-2.jpg" alt="Wooden photo frame display" className="h-full w-full object-cover" />
        </div>
      </section>

      <section className="mt-16 grid gap-8 lg:grid-cols-3">
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--soft)] text-[var(--gold)]"><Sparkles size={24} /></div>
          <h2 className="mt-5 text-xl font-black">Premium Wood Finish</h2>
          <p className="mt-3 text-[var(--muted)]">Choose from natural, warm, or dark board finishes for a modern and elegant photo display.</p>
        </article>
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--soft)] text-[var(--gold)]"><Paintbrush size={24} /></div>
          <h2 className="mt-5 text-xl font-black">Custom Sizes</h2>
          <p className="mt-3 text-[var(--muted)]">Frames are made to order in sizes that suit your living room, bedroom, office, or event venue.</p>
        </article>
        <article className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--soft)] text-[var(--gold)]"><Layers size={24} /></div>
          <h2 className="mt-5 text-xl font-black">Ready to Display</h2>
          <p className="mt-3 text-[var(--muted)]">Your printed board arrives with a finished back and hanging hardware so it is ready to install.</p>
        </article>
      </section>

      <section className="mt-20 grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="font-black uppercase tracking-[0.2em] text-[var(--gold)]">Why choose wood boards?</p>
          <h2 className="mt-4 text-4xl font-black">Beautiful, durable, and gift-ready photo displays.</h2>
          <p className="mt-4 max-w-xl text-[var(--muted)]">Wooden photo boards are ideal for unique keepsakes and elegant decor. They preserve the texture of your image while adding a warm natural finish that suits modern and classic interiors.</p>
          <ul className="mt-8 grid gap-3 text-sm text-[var(--muted)]">
            {frameBenefits.map((item) => (
              <li key={item} className="flex gap-3 rounded-3xl border border-[var(--border)] bg-[var(--soft)] p-4">
                <Check className="mt-1 text-[var(--gold)]" size={18} />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-4 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8">
          <h3 className="text-2xl font-black">How the order works</h3>
          <div className="grid gap-3">
            {frameSteps.map((step) => (
              <div key={step.title} className="rounded-3xl border border-[var(--border)] bg-[#05070b] p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--gold)]">{step.title}</p>
                <p className="mt-2 text-[var(--muted)]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-20">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-black uppercase tracking-[0.2em] text-[var(--gold)]">Pricing guide</p>
            <h2 className="mt-3 text-4xl font-black">Standard wooden board sizes</h2>
          </div>
          <Link href="/booking?service=Frames%20/%20Cadres" className="btn btn-primary inline-flex items-center gap-2">Request a Quote <ArrowRight size={18} /></Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {sizes.map((item) => (
            <div key={item.label} className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--gold)]">{item.label}</p>
              <p className="mt-4 text-3xl font-black">{item.value}</p>
              <p className="mt-3 text-lg font-black text-[var(--gold)]">{item.price}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <h2 className="text-3xl font-black">Gallery inspiration</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            "/studio-blog/wedding-package-1.jpg",
            "/studio-blog/wedding-package-3.jpg",
            "/studio-blog/outdoor-package-1.jpg",
            "/studio-blog/outdoor-package-2.jpg"
          ].map((src) => (
            <div key={src} className="overflow-hidden rounded-3xl border border-[var(--border)] bg-black">
              <img src={src} alt="Wooden photo frame inspiration" className="h-72 w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20 rounded-3xl border border-[var(--gold)] bg-[var(--gold)]/5 p-10 text-center">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-[var(--gold)]">Ready to celebrate your memories</p>
        <h2 className="mt-4 text-4xl font-black">Start your wooden photo frame order with Berwa Photo Hub</h2>
        <p className="mx-auto mt-4 max-w-2xl text-[var(--muted)]">Send us your photo and let our studio create a beautiful wood board display that fits your space and style.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/booking?service=Frames%20/%20Cadres" className="btn btn-primary inline-flex items-center gap-2">Request Order <ArrowRight size={18} /></Link>
          <a href={brand.whatsappDirect} target="_blank" rel="noreferrer" className="btn btn-gold inline-flex items-center gap-2">Message on WhatsApp</a>
        </div>
      </section>
    </main>
  );
}
