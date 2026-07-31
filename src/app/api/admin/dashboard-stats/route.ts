import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, products, categories, users } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const orderRows = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        status: orders.status,
        grandTotal: orders.grandTotal,
        createdAt: orders.createdAt,
        customerName: users.name,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(desc(orders.createdAt));

    const itemRows = await db
      .select({
        orderId: orderItems.orderId,
        productName: orderItems.productName,
        quantity: orderItems.quantity,
        subtotal: orderItems.subtotal,
        categoryName: categories.name,
      })
      .from(orderItems)
      .leftJoin(orders, eq(orderItems.orderId, orders.id))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id));

    const totalCustomers = (await db.select().from(users).where(eq(users.role, "customer"))).length;

    const validOrders = orderRows.filter((o) => o.status !== "cancelled");
    const orderIdToStatus = new Map(orderRows.map((o) => [o.id, o.status]));
    const validItems = itemRows.filter((it) => orderIdToStatus.get(it.orderId) !== "cancelled");

    const totalRevenue = validOrders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
    const totalOrders = validOrders.length;
    const totalProductsSold = validItems.reduce((sum, it) => sum + it.quantity, 0);

    // Recent orders with a representative product name
    const itemsByOrder = new Map<number, string[]>();
    for (const it of itemRows) {
      const list = itemsByOrder.get(it.orderId) ?? [];
      list.push(it.productName);
      itemsByOrder.set(it.orderId, list);
    }
    const recentOrders = orderRows.slice(0, 5).map((o) => {
      const names = itemsByOrder.get(o.id) ?? [];
      const productSummary = names.length > 1 ? `${names[0]} +${names.length - 1} lainnya` : names[0] ?? "-";
      return {
        orderNumber: o.orderNumber,
        customer: o.customerName ?? "Pelanggan",
        product: productSummary,
        amount: Number(o.grandTotal),
        status: o.status,
      };
    });

    // Monthly revenue trend for the last 6 months (fills months with no orders with 0)
    const now = new Date();
    const months: { key: string; label: string; revenue: number; orders: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: MONTH_LABELS[d.getMonth()], revenue: 0, orders: 0 });
    }
    const monthIndex = new Map(months.map((m, i) => [m.key, i]));
    for (const o of validOrders) {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const idx = monthIndex.get(key);
      if (idx !== undefined) {
        months[idx].revenue += Number(o.grandTotal);
        months[idx].orders += 1;
      }
    }

    // Month-over-month change
    const thisMonth = months[months.length - 1]?.revenue ?? 0;
    const lastMonth = months[months.length - 2]?.revenue ?? 0;
    const revenueChangePercent = lastMonth > 0 ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null;

    // Top products by quantity sold
    const productAgg = new Map<string, { name: string; sold: number; revenue: number }>();
    for (const it of validItems) {
      const existing = productAgg.get(it.productName) ?? { name: it.productName, sold: 0, revenue: 0 };
      existing.sold += it.quantity;
      existing.revenue += Number(it.subtotal);
      productAgg.set(it.productName, existing);
    }
    const topProducts = Array.from(productAgg.values()).sort((a, b) => b.sold - a.sold).slice(0, 5);

    // Category distribution by revenue
    const categoryAgg = new Map<string, number>();
    for (const it of validItems) {
      const name = it.categoryName ?? "Tanpa Kategori";
      categoryAgg.set(name, (categoryAgg.get(name) ?? 0) + Number(it.subtotal));
    }
    const categoryTotal = Array.from(categoryAgg.values()).reduce((s, v) => s + v, 0);
    const categoryDistribution = Array.from(categoryAgg.entries())
      .map(([name, revenue]) => ({ name, value: categoryTotal > 0 ? Math.round((revenue / categoryTotal) * 100) : 0 }))
      .sort((a, b) => b.value - a.value);

    return NextResponse.json({
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProductsSold,
      revenueChangePercent,
      recentOrders,
      monthlyRevenue: months.map((m) => ({ month: m.label, revenue: m.revenue, orders: m.orders })),
      topProducts,
      categoryDistribution,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    return NextResponse.json({ error: "Gagal memuat statistik" }, { status: 500 });
  }
}
