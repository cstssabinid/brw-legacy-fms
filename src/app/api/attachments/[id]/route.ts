import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { canAccessAdminPath } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const attachment = await prisma.attachment.findUnique({ where: { id } });
  if (!attachment || !attachment.fileUrl.startsWith("data:")) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const session = await getServerSession(authOptions);
  const isAdminView = Boolean(session && (
    canAccessAdminPath(session.user.role, "/admin/gallery") ||
    canAccessAdminPath(session.user.role, "/admin/blog")
  ));

  if (attachment.entityType === "GalleryImage") {
    const image = await prisma.galleryImage.findUnique({ where: { id: attachment.entityId }, select: { active: true } });
    if (!image || (!image.active && !isAdminView)) return NextResponse.json({ error: "Image not found" }, { status: 404 });
  } else if (attachment.entityType === "BlogPost") {
    const post = await prisma.blogPost.findUnique({ where: { id: attachment.entityId }, select: { status: true } });
    if (!post || (post.status !== "PUBLISHED" && !isAdminView)) return NextResponse.json({ error: "Image not found" }, { status: 404 });
  } else {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const comma = attachment.fileUrl.indexOf(",");
  if (comma < 0) return NextResponse.json({ error: "Image not found" }, { status: 404 });
  const bytes = Buffer.from(attachment.fileUrl.slice(comma + 1), "base64");
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": attachment.fileType,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": isAdminView ? "private, no-store" : "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Disposition": "inline"
    }
  });
}
