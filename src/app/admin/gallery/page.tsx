import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminSection } from "@/lib/server-permissions";

export const dynamic = "force-dynamic";

async function createGalleryImage(formData: FormData) {
  "use server";
  const session = await requireAdminSection("/admin/gallery");
  const title = String(formData.get("title") ?? "").trim();
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (title.length < 2 || category.length < 2 || !imageUrl) throw new Error("Title, image URL, and category are required");

  const item = await prisma.galleryImage.create({
    data: { title, imageUrl, category, description: description || undefined, active: true }
  });
  await prisma.auditLog.create({
    data: { userId: session.user.id, action: "Gallery image added", entityType: "GalleryImage", entityId: item.id, newValue: { title, imageUrl, category } }
  });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export default async function AdminGalleryPage() {
  const images = await prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-black">Gallery Management</h2>
      <form action={createGalleryImage} className="card grid gap-4 p-5">
        <h3 className="text-lg font-black">Add Gallery Image</h3>
        <div className="grid gap-4 md:grid-cols-2 mobile-stack">
          <input className="input" name="title" minLength={2} placeholder="Image title" required />
          <input className="input" name="category" minLength={2} placeholder="Category" required />
        </div>
        <input className="input" name="imageUrl" placeholder="Image URL or /gallery/file-name.jpg" required />
        <textarea className="input min-h-24" name="description" placeholder="Description (optional)" />
        <button className="btn btn-primary w-fit" type="submit">Add Image</button>
      </form>
      <div className="responsive-grid">
        {images.map((item) => (
          <article className="card p-4" key={item.id}>
            <h3 className="font-black">{item.title}</h3>
            <p className="text-sm text-[var(--muted)]">{item.category} · {item.active ? "Active" : "Inactive"}</p>
            <p className="mt-2 break-all text-xs">{item.imageUrl}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
