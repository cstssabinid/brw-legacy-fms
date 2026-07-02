"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { ContactModal } from "@/components/contact-modal";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  ["Home", "/"],
  ["Services", "/services"],
  ["Packages", "/packages"],
  ["Wedding", "/wedding"],
  ["Gallery", "/gallery"],
  ["Book Now", "/booking"],
  ["Login", "/login"]
];

export function PublicNav() {
  const [open, setOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  function openContact() {
    setOpen(false);
    setContactOpen(true);
  }

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[color:var(--background)]/88 backdrop-blur">
        <div className="page-shell flex items-center justify-between py-3">
          <Link href="/" className="flex items-center gap-3 font-black">
            <BrandLogo />
          </Link>
          <nav className="hidden items-center gap-5 text-sm font-bold lg:flex">
            {links.map(([label, href]) => <Link key={href} href={href} className="hover:text-[var(--gold)]">{label}</Link>)}
            <button type="button" className="font-bold hover:text-[var(--gold)]" onClick={openContact}>Contact</button>
            <ThemeToggle />
          </nav>
          <button className="btn card lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu"><Menu /></button>
        </div>
        {open && (
          <nav className="page-shell grid gap-2 pb-4 lg:hidden">
            {links.map(([label, href]) => <Link key={href} href={href} className="rounded-md px-2 py-2 font-bold hover:bg-black/5" onClick={() => setOpen(false)}>{label}</Link>)}
            <button type="button" className="rounded-md px-2 py-2 text-left font-bold hover:bg-black/5" onClick={openContact}>Contact</button>
            <ThemeToggle />
          </nav>
        )}
      </header>
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}
