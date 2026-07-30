import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

const testimonialUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  role: z.string().optional(),
  content: z.string().min(5).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = testimonialUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const [updated] = await db
      .update(testimonials)
      .set(parsed.data)
      .where(eq(testimonials.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Testimoni tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ testimonial: updated });
  } catch (err) {
    console.error("Update testimonial error:", err);
    return NextResponse.json({ error: "Gagal memperbarui testimoni" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { id } = await params;
    await db.delete(testimonials).where(eq(testimonials.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete testimonial error:", err);
    return NextResponse.json({ error: "Gagal menghapus testimoni" }, { status: 500 });
  }
}
