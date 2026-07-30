import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

const faqUpdateSchema = z.object({
  question: z.string().min(5).optional(),
  answer: z.string().min(5).optional(),
  category: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = faqUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const [updated] = await db.update(faqs).set(parsed.data).where(eq(faqs.id, Number(id))).returning();

    if (!updated) {
      return NextResponse.json({ error: "FAQ tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ faq: updated });
  } catch (err) {
    console.error("Update FAQ error:", err);
    return NextResponse.json({ error: "Gagal memperbarui FAQ" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { id } = await params;
    await db.delete(faqs).where(eq(faqs.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete FAQ error:", err);
    return NextResponse.json({ error: "Gagal menghapus FAQ" }, { status: 500 });
  }
}
