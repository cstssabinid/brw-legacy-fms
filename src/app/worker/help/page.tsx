import { packages } from "@/lib/brand";

export default function WorkerHelpPage() {
  return <div className="grid gap-5"><h2 className="text-2xl font-black">Worker Help</h2><section className="card p-5"><p>Use Berwa Assistant for steps on recording income, expenses, receipts, reports and package prices.</p><pre className="mt-4 overflow-auto text-sm">{JSON.stringify(packages, null, 2)}</pre></section></div>;
}
