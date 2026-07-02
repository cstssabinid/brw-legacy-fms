import { SimpleAdminPage } from "@/components/simple-admin-page";

export default function BlogAdminPage() {
  return <SimpleAdminPage title="Public Blog Posts"><div className="grid gap-3"><input className="input" placeholder="Post title" /><input className="input" placeholder="Slug" /><textarea className="input min-h-40" placeholder="Content" /><button className="btn btn-primary">Save Draft</button></div></SimpleAdminPage>;
}
