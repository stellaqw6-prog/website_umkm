import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { requireSeller } from "@/lib/require-admin";

const updateSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]).optional(),
  trackingNumber: z.string().optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const seller = await requireSeller(req);
  if ("error" in seller) return seller.error;

  try {
    const { id } = await params;

    const [order] = await db.select().from(orders).where(eq(orders.id, Number(id))).limit(1);
    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const isPrivileged = seller.session.role === "admin" || seller.session.role === "superadmin";
    if (!isPrivileged && order.sellerId !== seller.session.userId) {
      return NextResponse.json({ error: "Ini bukan pesanan untuk toko kamu" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const [updated] = await db
      .update(orders)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(orders.id, Number(id)))
      .returning();

    return NextResponse.json({ order: updated });
  } catch (err) {
    console.error("Seller update order error:", err);
    return NextResponse.json({ error: "Gagal memperbarui pesanan" }, { status: 500 });
  }
}
