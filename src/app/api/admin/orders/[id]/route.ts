import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, users, stores } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

const updateSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]).optional(),
  paymentStatus: z.enum(["unpaid", "paid", "expired", "refunded"]).optional(),
  trackingNumber: z.string().optional(),
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { id } = await params;

    const [row] = await db
      .select({
        order: orders,
        customerName: users.name,
        customerEmail: users.email,
        customerPhone: users.phone,
        storeName: stores.name,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .leftJoin(stores, eq(orders.sellerId, stores.sellerId))
      .where(eq(orders.id, Number(id)))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, row.order.id));

    return NextResponse.json({
      order: {
        ...row.order,
        customerName: row.customerName,
        customerEmail: row.customerEmail,
        customerPhone: row.customerPhone,
        storeName: row.storeName,
      },
      items,
    });
  } catch (err) {
    console.error("Get admin order detail error:", err);
    return NextResponse.json({ error: "Gagal memuat detail pesanan" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { id } = await params;
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

    if (!updated) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ order: updated });
  } catch (err) {
    console.error("Update order error:", err);
    return NextResponse.json({ error: "Gagal memperbarui pesanan" }, { status: 500 });
  }
}
