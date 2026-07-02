import { SimpleAdminPage } from "@/components/simple-admin-page";
import { brand } from "@/lib/brand";

export default function SettingsPage() {
  return <SimpleAdminPage title="System Settings"><pre className="overflow-auto text-sm">{JSON.stringify(brand, null, 2)}</pre></SimpleAdminPage>;
}
