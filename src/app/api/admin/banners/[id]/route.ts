import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { banners } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

const bannerUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  subtitle: z.string().optional(),
  image: z.string().min(1).optional(),
  link: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = bannerUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const [updated] = await db.update(banners).set(parsed.data).where(eq(banners.id, Number(id))).returning();

    if (!updated) {
      return NextResponse.json({ error: "Banner tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ banner: updated });
  } catch (err) {
    console.error("Update banner error:", err);
    return NextResponse.json({ error: "Gagal memperbarui banner" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { id } = await params;
    await db.delete(banners).where(eq(banners.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete banner error:", err);
    return NextResponse.json({ error: "Gagal menghapus banner" }, { status: 500 });
  }
}
