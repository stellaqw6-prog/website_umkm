import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems } from "@/db/schema";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Silakan login dulu" }, { status: 401 });
  }

  try {
    const { orderNumber } = await params;
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const isOwner = order.userId === session.userId;
    const isAdmin = session.role === "admin" || session.role === "superadmin";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Anda tidak punya akses ke pesanan ini" }, { status: 403 });
    }

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));

    return NextResponse.json({ order, items });
  } catch (err) {
    console.error("Get order detail error:", err);
    return NextResponse.json({ error: "Gagal memuat pesanan" }, { status: 500 });
  }
}
