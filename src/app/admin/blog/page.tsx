import { revalidatePath } from "next/cache";
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
  const coverImage = String(formData.get("coverImage") ?? "").trim();
  if (title.length < 2 || slug.length < 2 || content.length < 2) throw new Error("Title, slug, and content are required");

  const post = await prisma.blogPost.create({
    data: { title, slug, content, coverImage: coverImage || undefined, status: "DRAFT", authorId: session.user.id }
  });
  await prisma.auditLog.create({
    data: { userId: session.user.id, action: "Blog draft created", entityType: "BlogPost", entityId: post.id, newValue: { title, slug } }
  });
  revalidatePath("/admin/blog");
}

export default async function BlogAdminPage() {
  const posts = await prisma.blogPost.findMany({ include: { author: true }, orderBy: { createdAt: "desc" } });
  return (
    <div className="grid gap-5">
      <h2 className="text-2xl font-black">Public Blog Posts</h2>
      <form action={createBlogDraft} className="card grid gap-4 p-5">
        <h3 className="text-lg font-black">Add Blog Draft</h3>
        <div className="grid gap-4 md:grid-cols-2 mobile-stack">
          <input className="input" name="title" minLength={2} placeholder="Post title" required />
          <input className="input" name="slug" minLength={2} placeholder="Slug (optional; generated from title)" />
        </div>
        <input className="input" name="coverImage" type="url" placeholder="Cover image URL (optional)" />
        <textarea className="input min-h-40" name="content" minLength={2} placeholder="Content" required />
        <button className="btn btn-primary w-fit" type="submit">Save Draft</button>
      </form>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Title</th><th>Slug</th><th>Status</th><th>Author</th></tr></thead>
          <tbody>{posts.map((post) => <tr key={post.id}><td>{post.title}</td><td>{post.slug}</td><td>{post.status}</td><td>{post.author.name}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
