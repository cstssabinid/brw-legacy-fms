import { SimpleAdminPage } from "@/components/simple-admin-page";

export default function WorkerReportsPage() {
  return <SimpleAdminPage title="Daily Notes and Reports"><textarea className="input min-h-40" placeholder="Submit daily notes" /><button className="btn btn-primary mt-3">Submit Report</button></SimpleAdminPage>;
}
