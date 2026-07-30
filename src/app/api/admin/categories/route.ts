import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

const categorySchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  slug: z
    .string()
    .min(2, "Slug minimal 2 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda strip"),
  description: z.string().optional(),
  image: z.string().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

export async function GET() {
  const rows = await db.select().from(categories).orderBy(categories.sortOrder, desc(categories.createdAt));
  return NextResponse.json({ categories: rows });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const body = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const existing = await db.select().from(categories).where(eq(categories.slug, parsed.data.slug)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Slug sudah dipakai kategori lain" }, { status: 409 });
    }

    const [created] = await db.insert(categories).values(parsed.data).returning();
    return NextResponse.json({ category: created }, { status: 201 });
  } catch (err) {
    console.error("Create category error:", err);
    return NextResponse.json({ error: "Gagal membuat kategori" }, { status: 500 });
  }
}
