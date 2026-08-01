import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, orders } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  const customers = await db.select().from(users).where(eq(users.role, "customer"));
  const allOrders = await db.select().from(orders);

  const result = customers.map((c) => {
    const customerOrders = allOrders.filter((o) => o.userId === c.id && o.status !== "cancelled");
    const totalSpent = customerOrders.reduce((sum, o) => sum + Number(o.grandTotal), 0);
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      membership: c.membership,
      isActive: c.isActive,
      orders: customerOrders.length,
      totalSpent,
      joined: c.createdAt,
    };
  });

  result.sort((a, b) => b.totalSpent - a.totalSpent);

  return NextResponse.json({ customers: result });
}
