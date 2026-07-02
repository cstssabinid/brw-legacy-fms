import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function PortalShell({ children, nav, title }: { children: React.ReactNode; nav: { href: string; label: string }[]; title: string }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[270px_1fr]">
      <aside className="sticky top-0 z-20 border-b border-[var(--border)] bg-[var(--card)] p-4 md:h-screen md:border-b-0 md:border-r">
        <Link href="/" className="mb-6 flex items-center gap-3 font-black">
          <BrandLogo />
        </Link>
        <nav className="flex gap-2 overflow-x-auto md:grid md:overflow-visible">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/10">
              <LayoutDashboard size={16} /> {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>
        <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[color:var(--background)]/88 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3 md:px-8">
            <h1 className="text-xl font-black">{title}</h1>
            <ThemeToggle />
          </div>
        </header>
        <main className="px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
