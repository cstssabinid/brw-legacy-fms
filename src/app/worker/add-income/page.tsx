import { TransactionForm } from "@/components/transaction-form";
import { getActiveCatalogPackages, getActiveServices } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function WorkerIncomePage() {
  const [services, packages] = await Promise.all([getActiveServices(), getActiveCatalogPackages()]);
  return <div className="grid gap-5"><h2 className="text-2xl font-black">Record Income</h2><TransactionForm type="INCOME" services={services} packages={packages} /></div>;
}
