import { SimpleAdminPage } from "@/components/simple-admin-page";

export default function LoansPage() {
  return <SimpleAdminPage title="Loan Payment Planning"><div className="grid gap-3 md:grid-cols-2 mobile-stack"><input className="input" placeholder="Loan name" /><input className="input" placeholder="Source of payment" /><input className="input" type="date" /><input className="input" type="number" placeholder="Amount to be paid" /><input className="input" type="number" placeholder="Amount paid" /><select className="input"><option>planned</option><option>partially paid</option><option>paid</option><option>overdue</option></select></div></SimpleAdminPage>;
}
