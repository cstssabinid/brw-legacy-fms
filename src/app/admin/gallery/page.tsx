import { revalidatePath } from "next/cache";
import { ConfirmDeleteForm } from "@/components/confirm-delete-form";
import { uploadedImageDataUrl } from "@/lib/admin-image";
import { prisma } from "@/lib/prisma";
import { requireAdminSection } from "@/lib/server-permissions";

export const dynamic = "force-dynamic";

async function createGalleryImage(formData: FormData) {
  "use server";
  const session = await requireAdminSection("/admin/gallery");
  const title = String(formData.get("title") ?? "").trim();
  const imageFile = formData.get("image");
  const uploadedImage = await uploadedImageDataUrl(imageFile);
  const imageUrl = uploadedImage ? "" : String(formData.get("imageUrl") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (title.length < 2 || category.length < 2 || (!uploadedImage && !imageUrl)) throw new Error("Add a title and category, then upload an image or paste its URL");

  const item = await prisma.$transaction(async (tx) => {
    let galleryImage = await tx.galleryImage.create({
      data: { title, imageUrl: imageUrl || "upload-pending", category, description: description || undefined, active: true }
    });
    if (uploadedImage) {
      const attachment = await tx.attachment.create({
        data: {
          entityType: "GalleryImage",
          entityId: galleryImage.id,
          fileUrl: uploadedImage,
          fileName: imageFile instanceof File && imageFile.name ? imageFile.name : `${title}.image`,
          fileType: imageFile instanceof File ? imageFile.type : "image/jpeg",
          uploadedById: session.user.id
        }
      });
      galleryImage = await tx.galleryImage.update({ where: { id: galleryImage.id }, data: { imageUrl: `/api/attachments/${attachment.id}` } });
    }
    return galleryImage;
  });
  await prisma.auditLog.create({
    data: { userId: session.user.id, action: "Gallery image added", entityType: "GalleryImage", entityId: item.id, newValue: { title, category, imageUploaded: Boolean(uploadedImage), imageUrl: uploadedImage ? item.imageUrl : imageUrl } }
  });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

async function updateGalleryImage(formData: FormData) {
  "use server";
  const session = await requireAdminSection("/admin/gallery");
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageFile = formData.get("image");
  const uploadedImage = await uploadedImageDataUrl(imageFile);
  const requestedImageUrl = String(formData.get("imageUrl") ?? "").trim();
  const active = formData.get("active") === "on";
  const existing = await prisma.galleryImage.findUnique({ where: { id } });
  const imageUrl = requestedImageUrl || existing?.imageUrl || "";
  if (!existing || title.length < 2 || category.length < 2 || (!uploadedImage && !imageUrl)) {
    throw new Error("Add a title, category, and image or image URL");
  }

  const item = await prisma.$transaction(async (tx) => {
    let updated = await tx.galleryImage.update({
      where: { id },
      data: { title, category, description: description || null, active, imageUrl: uploadedImage ? existing.imageUrl : imageUrl }
    });
    if (uploadedImage) {
      const attachment = await tx.attachment.create({
        data: {
          entityType: "GalleryImage",
          entityId: id,
          fileUrl: uploadedImage,
          fileName: imageFile instanceof File && imageFile.name ? imageFile.name : `${title}.image`,
          fileType: imageFile instanceof File ? imageFile.type : "image/jpeg",
          uploadedById: session.user.id
        }
      });
      updated = await tx.galleryImage.update({ where: { id }, data: { imageUrl: `/api/attachments/${attachment.id}` } });
      await tx.attachment.deleteMany({ where: { entityType: "GalleryImage", entityId: id, id: { not: attachment.id } } });
    } else if (requestedImageUrl && requestedImageUrl !== existing.imageUrl) {
      await tx.attachment.deleteMany({ where: { entityType: "GalleryImage", entityId: id } });
    }
    return updated;
  });
  await prisma.auditLog.create({
    data: { userId: session.user.id, action: "Gallery image updated", entityType: "GalleryImage", entityId: id, oldValue: { title: existing.title, category: existing.category, active: existing.active, imageUrl: existing.imageUrl }, newValue: { title, category, active, imageUrl: item.imageUrl, imageUploaded: Boolean(uploadedImage) } }
  });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

async function deleteGalleryImage(formData: FormData) {
  "use server";
  const session = await requireAdminSection("/admin/gallery");
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.galleryImage.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.$transaction(async (tx) => {
    await tx.attachment.deleteMany({ where: { entityType: "GalleryImage", entityId: id } });
    await tx.galleryImage.delete({ where: { id } });
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "Gallery image deleted",
        entityType: "GalleryImage",
        entityId: id,
        oldValue: { title: existing.title, category: existing.category, description: existing.description, imageUrl: existing.imageUrl, active: existing.active }
      }
    });
  });
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export default async function AdminGalleryPage() {
  const images = await prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-black">Gallery Management</h2>
      <form action={createGalleryImage} encType="multipart/form-data" className="card grid gap-4 p-5">
        <h3 className="text-lg font-black">Add Gallery Image</h3>
        <div className="grid gap-4 md:grid-cols-2 mobile-stack">
          <input className="input" name="title" minLength={2} placeholder="Image title" required />
          <input className="input" name="category" minLength={2} placeholder="Category" required />
        </div>
        <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Upload an image from this computer (JPG, PNG, WebP, or GIF; up to 4 MB)</span><input className="input" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" /></label>
        <input className="input" name="imageUrl" placeholder="Or paste an image URL" />
        <textarea className="input min-h-24" name="description" placeholder="Description (optional)" />
        <button className="btn btn-primary w-fit" type="submit">Add Image</button>
      </form>
      <div className="responsive-grid">
        {images.map((item) => (
          <article className="card p-4" key={item.id}>
            <h3 className="font-black">{item.title}</h3>
            <p className="text-sm text-[var(--muted)]">{item.category} · {item.active ? "Active" : "Inactive"}</p>
            <img className="mt-3 aspect-[4/3] w-full rounded-xl object-cover" src={item.imageUrl} alt={item.title} />
            <details className="mt-4">
              <summary className="cursor-pointer font-bold">Edit details or photo</summary>
              <form action={updateGalleryImage} encType="multipart/form-data" className="mt-3 grid gap-3">
                <input type="hidden" name="id" value={item.id} />
                <input className="input" name="title" defaultValue={item.title} minLength={2} required />
                <input className="input" name="category" defaultValue={item.category} minLength={2} required />
                <label className="grid gap-2 text-sm"><span>Replace with an image from this computer (JPG, PNG, WebP, or GIF; up to 4 MB)</span><input className="input" name="image" type="file" accept="image/jpeg,image/png,image/webp,image/gif" /></label>
                <input className="input" name="imageUrl" defaultValue={item.imageUrl.startsWith("/api/attachments/") ? "" : item.imageUrl} placeholder="Or paste an image URL" />
                <textarea className="input min-h-20" name="description" defaultValue={item.description ?? ""} placeholder="Description (optional)" />
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={item.active} />Show on public gallery</label>
                <button className="btn btn-primary" type="submit">Save changes</button>
              </form>
            </details>
            <div className="mt-3">
              <ConfirmDeleteForm action={deleteGalleryImage} itemId={item.id} itemLabel={`gallery item “${item.title}”`} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
