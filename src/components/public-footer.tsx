import Link from "next/link";
import { Instagram, Mail, MapPin, MessageCircle, Music2, ShoppingBag } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { brand } from "@/lib/brand";

const socialLinks = [
  {
    label: "Instagram",
    href: brand.instagram,
    icon: Instagram
  },
  {
    label: "TikTok",
    href: brand.tiktok,
    icon: Music2
  },
  {
    label: "WhatsApp Catalog",
    href: brand.whatsappCatalog,
    icon: ShoppingBag
  },
  {
    label: "WhatsApp Direct",
    href: brand.whatsappDirect,
    icon: MessageCircle
  },
  {
    label: "Email",
    href: `mailto:${brand.email}`,
    icon: Mail
  }
];

const footerLinks = [
  ["Services", "/services"],
  ["Packages", "/packages"],
  ["Gallery", "/gallery"],
  ["Booking", "/booking"]
];

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[#05070b] text-white">
      <div className="page-shell grid gap-10 py-10 md:grid-cols-[1.2fr_0.8fr_1fr] mobile-stack">
        <div>
          <Link href="/" className="inline-flex font-black">
            <BrandLogo />
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/72">{brand.slogan}</p>
          <div className="group relative mt-4 w-fit">
            <a
              href={brand.mapLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-2 text-sm font-bold text-white/72 hover:text-[var(--gold)]"
            >
              <MapPin className="mt-0.5 shrink-0 text-[var(--gold)]" size={18} />
              <span>{brand.location}</span>
            </a>
            <div className="invisible absolute bottom-full left-0 z-20 w-72 overflow-hidden rounded-lg border border-white/12 bg-[#05070b] opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 sm:w-80">
              <span className="block aspect-[16/10]">
                <iframe
                  title="Berwa Photo Hub map preview"
                  className="h-full w-full pointer-events-none"
                  loading="lazy"
                  src="https://maps.google.com/maps?q=KN%2020%20Ave%2C%20Kigali%2C%20Rwanda&t=&z=13&ie=UTF8&iwloc=&output=embed"
                />
              </span>
              <span className="block border-t border-white/10 px-3 py-2 text-xs font-bold text-white/72">
                Click map for detailed location
              </span>
              <a
                href={brand.mapLink}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0"
                aria-label="Open Berwa Photo Hub location on Google Maps"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[var(--gold)]">Studio Blog</h2>
          <nav className="mt-4 grid gap-2 text-sm font-bold text-white/78">
            {footerLinks.map(([label, href]) => (
              <Link key={href} href={href} className="w-fit hover:text-[var(--gold)]">
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.16em] text-[var(--gold)]">Follow Us</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                className="grid h-11 w-11 place-items-center rounded-lg border border-white/12 bg-white/8 text-white transition hover:border-[var(--gold)] hover:text-[var(--gold)]"
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel={href.startsWith("mailto:") ? undefined : "noreferrer"}
                aria-label={label}
                title={label}
              >
                <Icon size={20} />
              </a>
            ))}
          </div>
          <a className="mt-5 inline-flex text-sm font-bold text-white/78 hover:text-[var(--gold)]" href={`mailto:${brand.email}`}>
            {brand.email}
          </a>
          <a className="mt-3 inline-flex text-sm font-bold text-white/78 hover:text-[var(--gold)]" href={brand.whatsappDirect} target="_blank" rel="noreferrer">
            {brand.phone}
          </a>
        </div>
      </div>
      <div className="border-t border-white/10 py-4">
        <div className="page-shell flex flex-wrap items-center justify-between gap-3 text-xs font-bold text-white/56">
          <p>{new Date().getFullYear()} {brand.studioName}</p>
          <a href={brand.whatsappCatalog} target="_blank" rel="noreferrer" className="hover:text-[var(--gold)]">
            View our catalog on WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}
