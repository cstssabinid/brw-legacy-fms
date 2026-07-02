import { SimpleAdminPage } from "@/components/simple-admin-page";

export default function BudgetPage() {
  return <SimpleAdminPage title="Budget Tracking"><div className="grid gap-3 md:grid-cols-2 mobile-stack"><input className="input" placeholder="Month" /><input className="input" placeholder="Category" /><input className="input" type="number" placeholder="Planned amount" /><input className="input" type="number" placeholder="Actual amount" /><textarea className="input md:col-span-2" placeholder="Notes" /></div></SimpleAdminPage>;
}
