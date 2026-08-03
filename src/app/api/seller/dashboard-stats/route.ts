import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, products } from "@/db/schema";
import { requireSeller } from "@/lib/require-admin";

export async function GET(req: NextRequest) {
  const seller = await requireSeller(req);
  if ("error" in seller) return seller.error;

  const sellerId = seller.session.userId;

  const sellerOrders = await db.select().from(orders).where(eq(orders.sellerId, sellerId));
  const sellerProducts = await db.select().from(products).where(eq(products.sellerId, sellerId));

  const validOrders = sellerOrders.filter((o) => o.status !== "cancelled");
  const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
  const totalOrders = validOrders.length;
  const pendingOrders = sellerOrders.filter((o) => o.status === "pending").length;
  const totalProducts = sellerProducts.length;
  const lowStockProducts = sellerProducts.filter((p) => p.isActive && p.stock <= 5).length;

  const orderIds = validOrders.map((o) => o.id);
  const items = orderIds.length > 0 ? await db.select().from(orderItems) : [];
  const relevantItems = items.filter((it) => orderIds.includes(it.orderId));
  const totalProductsSold = relevantItems.reduce((sum, it) => sum + it.quantity, 0);

  const recentOrders = [...sellerOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((o) => ({ orderNumber: o.orderNumber, status: o.status, grandTotal: o.grandTotal, createdAt: o.createdAt }));

  return NextResponse.json({
    totalRevenue,
    totalOrders,
    pendingOrders,
    totalProducts,
    lowStockProducts,
    totalProductsSold,
    recentOrders,
  });
}
