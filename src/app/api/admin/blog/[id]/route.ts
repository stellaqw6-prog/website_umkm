import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

const blogUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda strip")
    .optional(),
  excerpt: z.string().optional(),
  content: z.string().min(10).optional(),
  coverImage: z.string().optional(),
  category: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = blogUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
    if (parsed.data.isPublished) {
      updateData.publishedAt = new Date();
    }

    const [updated] = await db
      .update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ post: updated });
  } catch (err) {
    console.error("Update blog post error:", err);
    return NextResponse.json({ error: "Gagal memperbarui artikel" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { id } = await params;
    await db.delete(blogPosts).where(eq(blogPosts.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete blog post error:", err);
    return NextResponse.json({ error: "Gagal menghapus artikel" }, { status: 500 });
  }
}
