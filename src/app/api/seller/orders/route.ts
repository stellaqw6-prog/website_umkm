import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { requireSeller } from "@/lib/require-admin";

export async function GET(req: NextRequest) {
  const seller = await requireSeller(req);
  if ("error" in seller) return seller.error;

  const rows = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      paymentStatus: orders.paymentStatus,
      paymentProofUrl: orders.paymentProofUrl,
      grandTotal: orders.grandTotal,
      createdAt: orders.createdAt,
      customerName: users.name,
      customerEmail: users.email,
    })
    .from(orders)
    .leftJoin(users, eq(orders.userId, users.id))
    .where(eq(orders.sellerId, seller.session.userId))
    .orderBy(desc(orders.createdAt));

  return NextResponse.json({ orders: rows });
}
