import Link from "next/link";
import { ArrowRight, Camera, Check } from "lucide-react";
import { rwf } from "@/lib/utils";

type PackageCardItem = {
  name: string;
  price: number;
  includes: string[];
  level?: string | null;
};

export function PackageCard({
  item,
  premium,
  category = "Studio",
  imageSrc = "/brand/studio-placeholder.svg",
  showBookingAction = true
}: {
  item: PackageCardItem;
  premium?: boolean;
  category?: "Indoor" | "Outdoor" | "Wedding" | "Event" | "Studio";
  imageSrc?: string;
  showBookingAction?: boolean;
}) {
  const serviceByCategory = {
    Indoor: "Studio Portrait Sessions",
    Outdoor: "Outdoor Photography",
    Wedding: "Wedding Photography",
    Event: "Event Coverage",
    Studio: "Studio Portrait Sessions"
  };
  const bookingHref = `/booking?package=${encodeURIComponent(item.name)}&service=${encodeURIComponent(serviceByCategory[category])}`;
  const isPlatinum = item.level === "Platinum" || item.name.toLowerCase().includes("premium event");

  return (
    <article className={`card group flex min-h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-2xl ${isPlatinum ? "border-white/20 bg-black text-white shadow-[0_24px_70px_rgba(0,0,0,0.3)]" : ""}`}>
      <div className={`relative aspect-[4/3] overflow-hidden ${isPlatinum ? "bg-black" : "bg-[#05070b]"}`}>
        <img src={imageSrc} alt={`${category} ${item.name} package`} className="h-full w-full object-cover opacity-90 transition duration-300 group-hover:scale-105" />
        <div className={`absolute inset-0 ${isPlatinum ? "bg-[linear-gradient(135deg,rgba(0,0,0,0.92),rgba(6,26,56,0.72),rgba(255,255,255,0.12))]" : "bg-gradient-to-t from-black/72 via-black/10 to-transparent"}`} />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 text-white">
          <div>
            <p className="flex items-center gap-1.5 text-xs font-black uppercase text-[var(--gold)]"><Camera size={14} /> {category}</p>
            <h3 className="mt-1 text-xl font-black">{item.name}</h3>
            {item.level && <p className="mt-1 text-xs font-black uppercase tracking-wide text-white/78">{item.level}</p>}
          </div>
          {(premium || isPlatinum) && <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-black">{isPlatinum ? "Platinum" : "Premium"}</span>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className={`text-3xl font-black ${isPlatinum ? "text-white" : "text-[var(--navy)] dark:text-[var(--gold)]"}`}>{rwf(item.price)}</p>
        <ul className="mt-5 grid gap-3 text-sm">
        {item.includes.map((include) => (
          <li key={include} className="flex gap-2"><Check className="mt-0.5 shrink-0 text-[var(--gold)]" size={18} />{include}</li>
        ))}
        </ul>
        {showBookingAction && <Link className={`btn mt-6 w-full ${isPlatinum ? "btn-gold" : "btn-primary"}`} href={bookingHref}>Book This Package <ArrowRight size={17} /></Link>}
      </div>
    </article>
  );
}
