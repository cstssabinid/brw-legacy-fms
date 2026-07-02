import { brand } from "@/lib/brand";

export function BrandLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <span className="brand-logo-mark grid place-items-center overflow-hidden rounded-md border border-[var(--border)] bg-[#05070b]">
        <img className="brand-logo-light h-full w-full object-contain p-1.5" src="/studio-blog/logo-for-light-mode.png" alt="" />
        <img className="brand-logo-dark hidden h-full w-full object-contain p-1.5" src="/studio-blog/logo-for-dark-mode.png" alt="" />
      </span>
      {!compact && (
        <span>
          <span className="block leading-tight">{brand.studioName}</span>
          <span className="block text-xs font-semibold text-[var(--muted)]">{brand.slogan}</span>
        </span>
      )}
    </span>
  );
}
