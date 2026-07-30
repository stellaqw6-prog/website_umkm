import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

const blogSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda strip"),
  excerpt: z.string().optional(),
  content: z.string().min(10, "Konten minimal 10 karakter"),
  coverImage: z.string().optional(),
  category: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  const rows = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  return NextResponse.json({ posts: rows });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const body = await req.json();
    const parsed = blogSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const existing = await db.select().from(blogPosts).where(eq(blogPosts.slug, parsed.data.slug)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Slug sudah dipakai artikel lain" }, { status: 409 });
    }

    const [created] = await db
      .insert(blogPosts)
      .values({
        ...parsed.data,
        authorId: admin.session.userId,
        publishedAt: parsed.data.isPublished ? new Date() : null,
      })
      .returning();

    return NextResponse.json({ post: created }, { status: 201 });
  } catch (err) {
    console.error("Create blog post error:", err);
    return NextResponse.json({ error: "Gagal membuat artikel" }, { status: 500 });
  }
}
