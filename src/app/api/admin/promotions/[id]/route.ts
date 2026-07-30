import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { promotions } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

const promotionUpdateSchema = z.object({
  code: z
    .string()
    .min(3)
    .transform((v) => v.toUpperCase())
    .optional(),
  type: z.enum(["percentage", "fixed", "free_shipping"]).optional(),
  value: z.union([z.string(), z.number()]).transform((v) => String(v)).optional(),
  minPurchase: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined || v === "" ? undefined : String(v))),
  usageLimit: z.number().int().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = promotionUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.startDate) updateData.startDate = new Date(parsed.data.startDate);
    if (parsed.data.endDate) updateData.endDate = new Date(parsed.data.endDate);

    const [updated] = await db
      .update(promotions)
      .set(updateData)
      .where(eq(promotions.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Promo tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ promotion: updated });
  } catch (err) {
    console.error("Update promotion error:", err);
    return NextResponse.json({ error: "Gagal memperbarui promo" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { id } = await params;
    await db.delete(promotions).where(eq(promotions.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete promotion error:", err);
    return NextResponse.json({ error: "Gagal menghapus promo" }, { status: 500 });
  }
}
