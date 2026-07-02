import { BookingForm } from "./booking-form";
import { getActiveCatalogPackages, getActiveServices } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function BookingPage() {
  const [services, packages] = await Promise.all([getActiveServices(), getActiveCatalogPackages()]);
  return (
    <main className="page-shell py-12">
      <h1 className="text-4xl font-black">Book Berwa Photo Hub</h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">Submit your session, wedding or service request. The admin dashboard receives a notification and can assign a worker.</p>
      <div className="mt-8"><BookingForm services={services} packages={packages} /></div>
    </main>
  );
}
