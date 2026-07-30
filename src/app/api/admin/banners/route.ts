import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

const bannerSchema = z.object({
  title: z.string().min(2, "Judul minimal 2 karakter"),
  subtitle: z.string().optional(),
  image: z.string().min(1, "Gambar wajib diisi (URL)"),
  link: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  const rows = await db.select().from(banners).orderBy(banners.sortOrder);
  return NextResponse.json({ banners: rows });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const body = await req.json();
    const parsed = bannerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const [created] = await db.insert(banners).values(parsed.data).returning();
    return NextResponse.json({ banner: created }, { status: 201 });
  } catch (err) {
    console.error("Create banner error:", err);
    return NextResponse.json({ error: "Gagal membuat banner" }, { status: 500 });
  }
}
