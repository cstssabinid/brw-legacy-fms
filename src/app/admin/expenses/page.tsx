import { TransactionForm } from "@/components/transaction-form";

export default function AdminExpensesPage() {
  return <div className="grid gap-5"><h2 className="text-2xl font-black">Add Expense</h2><TransactionForm type="EXPENSE" /></div>;
}
