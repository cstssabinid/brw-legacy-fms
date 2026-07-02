import { TransactionForm } from "@/components/transaction-form";

export default function WorkerExpensePage() {
  return <div className="grid gap-5"><h2 className="text-2xl font-black">Record Allowed Expense</h2><TransactionForm type="EXPENSE" /></div>;
}
