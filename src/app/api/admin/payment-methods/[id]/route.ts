import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { paymentMethods } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

const paymentMethodUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    type: z.enum(["ewallet", "bank", "cod"]).optional(),
    provider: z.string().min(1).optional(),
    accountNumber: z.string().optional(),
    accountName: z.string().optional(),
    qrImage: z.string().optional(),
    instructions: z.string().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  })
  .transform((data) => ({
    ...data,
    accountNumber: data.type === "cod" ? "-" : data.accountNumber,
    accountName: data.type === "cod" ? "-" : data.accountName,
  }));

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = paymentMethodUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const [updated] = await db
      .update(paymentMethods)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(paymentMethods.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Metode pembayaran tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ paymentMethod: updated });
  } catch (err) {
    console.error("Update payment method error:", err);
    return NextResponse.json({ error: "Gagal memperbarui metode pembayaran" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { id } = await params;
    await db.delete(paymentMethods).where(eq(paymentMethods.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete payment method error:", err);
    return NextResponse.json({ error: "Gagal menghapus metode pembayaran" }, { status: 500 });
  }
}
