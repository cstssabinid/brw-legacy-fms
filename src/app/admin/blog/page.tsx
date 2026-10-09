import { revalidatePath } from "next/cache";
import { ConfirmDeleteForm } from "@/components/confirm-delete-form";
import { uploadedImageDataUrl } from "@/lib/admin-image";
import { prisma } from "@/lib/prisma";
import { requireAdminSection } from "@/lib/server-permissions";

export const dynamic = "force-dynamic";

function normalizedSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function createBlogDraft(formData: FormData) {
  "use server";
  const session = await requireAdminSection("/admin/blog");
  const title = String(formData.get("title") ?? "").trim();
  const requestedSlug = String(formData.get("slug") ?? "").trim();
  const slug = normalizedSlug(requestedSlug || title);
  const content = String(formData.get("content") ?? "").trim();
  const coverFile = formData.get("coverImageFile");
  const uploadedCover = await uploadedImageDataUrl(coverFile);
  const coverImage = uploadedCover ? null : String(formData.get("coverImage") ?? "").trim() || null;
  if (title.length < 2 || slug.length < 2 || content.length < 2) throw new Error("Title, slug, and content are required");

  const post = await prisma.$transaction(async (tx) => {
    let blogPost = await tx.blogPost.create({
      data: { title, slug, content, coverImage, status: "DRAFT", authorId: session.user.id }
    });
    if (uploadedCover) {
      const attachment = await tx.attachment.create({
        data: {
          entityType: "BlogPost",
          entityId: blogPost.id,
          fileUrl: uploadedCover,
          fileName: coverFile instanceof File && coverFile.name ? coverFile.name : `${title}.image`,
          fileType: coverFile instanceof File ? coverFile.type : "image/jpeg",
          uploadedById: session.user.id
        }
      });
      blogPost = await tx.blogPost.update({ where: { id: blogPost.id }, data: { coverImage: `/api/attachments/${attachment.id}` } });
    }
    return blogPost;
  });
  await prisma.auditLog.create({
    data: { userId: session.user.id, action: "Blog draft created", entityType: "BlogPost", entityId: post.id, newValue: { title, slug } }
  });
  revalidatePath("/admin/blog");
}

async function updateBlogPost(formData: FormData) {
  "use server";
  const session = await requireAdminSection("/admin/blog");
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const requestedSlug = String(formData.get("slug") ?? "").trim();
  const slug = normalizedSlug(requestedSlug || title);
  const content = String(formData.get("content") ?? "").trim();
  const coverFile = formData.get("coverImageFile");
  const uploadedCover = await uploadedImageDataUrl(coverFile);
  const requestedCover = String(formData.get("coverImage") ?? "").trim();
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing || title.length < 2 || slug.length < 2 || content.length < 2) {
    throw new Error("Enter a title, slug, and post content");
  }
  const coverImage = uploadedCover ? existing.coverImage : requestedCover || existing.coverImage;

  const post = await prisma.$transaction(async (tx) => {
    let updated = await tx.blogPost.update({ where: { id }, data: { title, slug, content, coverImage } });
    if (uploadedCover) {
      const attachment = await tx.attachment.create({
        data: {
          entityType: "BlogPost",
          entityId: id,
          fileUrl: uploadedCover,
          fileName: coverFile instanceof File && coverFile.name ? coverFile.name : `${title}.image`,
          fileType: coverFile instanceof File ? coverFile.type : "image/jpeg",
          uploadedById: session.user.id
        }
      });
      updated = await tx.blogPost.update({ where: { id }, data: { coverImage: `/api/attachments/${attachment.id}` } });
      await tx.attachment.deleteMany({ where: { entityType: "BlogPost", entityId: id, id: { not: attachment.id } } });
    } else if (requestedCover && requestedCover !== existing.coverImage) {
      await tx.attachment.deleteMany({ where: { entityType: "BlogPost", entityId: id } });
    }
    return updated;
  });
  await prisma.auditLog.create({
    data: { userId: session.user.id, action: "Blog post updated", entityType: "BlogPost", entityId: id, oldValue: { title: existing.title, slug: existing.slug, status: existing.status, coverImage: existing.coverImage }, newValue: { title, slug, status: post.status, coverImage: post.coverImage, imageUploaded: Boolean(uploadedCover) } }
  });
  revalidatePath("/admin/blog");
}

async function deleteBlogPost(formData: FormData) {
  "use server";
  const session = await requireAdminSection("/admin/blog");
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) return;

  await prisma.$transaction(async (tx) => {
    await tx.attachment.deleteMany({ where: { entityType: "BlogPost", entityId: id } });
    await tx.blogPost.delete({ where: { id } });
    await tx.auditLog.create({
      data: {
        userId: session.user.id,
        action: "Blog post deleted",
        entityType: "BlogPost",
        entityId: id,
        oldValue: { title: existing.title, slug: existing.slug, status: existing.status, coverImage: existing.coverImage }
      }
    });
  });
  revalidatePath("/admin/blog");
}

export default async function BlogAdminPage() {
  const posts = await prisma.blogPost.findMany({ include: { author: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-black">Public Blog Posts</h2>
      <form action={createBlogDraft} encType="multipart/form-data" className="card grid gap-4 p-5">
        <h3 className="text-lg font-black">Add Blog Draft</h3>
        <div className="grid gap-4 md:grid-cols-2 mobile-stack">
          <input className="input" name="title" minLength={2} placeholder="Post title" required />
          <input className="input" name="slug" minLength={2} placeholder="Slug (optional; generated from title)" />
        </div>
        <div className="grid gap-3 md:grid-cols-2 mobile-stack">
          <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Upload cover image (JPG, PNG, WebP, or GIF; up to 4 MB)</span><input className="input" name="coverImageFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" /></label>
          <label className="grid gap-2"><span className="text-sm font-semibold text-[var(--muted)]">Or use an image URL</span><input className="input" name="coverImage" type="url" placeholder="https://..." /></label>
        </div>
        <textarea className="input min-h-40" name="content" minLength={2} placeholder="Content" required />
        <button className="btn btn-primary w-fit" type="submit">Save Draft</button>
      </form>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Title</th><th>Slug</th><th>Status</th><th>Author</th></tr></thead>
          <tbody>{posts.map((post) => <tr key={post.id}>
            <td><div className="flex items-center gap-3">{post.coverImage && <img src={post.coverImage} alt="" className="h-12 w-16 rounded object-cover" />}<span>{post.title}</span></div>
              <details className="mt-2"><summary className="cursor-pointer text-sm font-bold">Edit post</summary>
                <form action={updateBlogPost} encType="multipart/form-data" className="mt-3 grid gap-3">
                  <input type="hidden" name="id" value={post.id} />
                  <input className="input" name="title" defaultValue={post.title} minLength={2} required />
                  <input className="input" name="slug" defaultValue={post.slug} minLength={2} required />
                  <label className="grid gap-2 text-sm"><span>Replace cover with an image from this computer (JPG, PNG, WebP, or GIF; up to 4 MB)</span><input className="input" name="coverImageFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif" /></label>
                  <input className="input" name="coverImage" defaultValue={post.coverImage?.startsWith("/api/attachments/") ? "" : post.coverImage ?? ""} placeholder="Or use an image URL" />
                  <textarea className="input min-h-32" name="content" defaultValue={post.content} minLength={2} required />
                  <button className="btn btn-primary" type="submit">Save post</button>
                </form>
              </details>
              <div className="mt-3 max-w-48">
                <ConfirmDeleteForm action={deleteBlogPost} itemId={post.id} itemLabel={`blog post “${post.title}”`} />
              </div>
            </td><td>{post.slug}</td><td>{post.status}</td><td>{post.author.name}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
