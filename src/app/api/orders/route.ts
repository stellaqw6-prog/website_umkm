import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, products, promotions } from "@/db/schema";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/order-utils";

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "Keranjang kosong"),
  shippingAddress: z.string().min(10, "Alamat pengiriman minimal 10 karakter"),
  paymentMethod: z.string().min(1, "Pilih metode pembayaran"),
  notes: z.string().optional(),
  promoCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Silakan login dulu untuk melanjutkan checkout" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const { items, shippingAddress, paymentMethod, notes, promoCode } = parsed.data;

    // Ambil data produk terbaru dari database (harga & stok tidak boleh dipercaya dari client)
    const productIds = items.map((i) => i.productId);
    const dbProducts = await db.select().from(products).where(eq(products.isActive, true));
    const productMap = new Map(dbProducts.filter((p) => productIds.includes(p.id)).map((p) => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Produk dengan ID ${item.productId} tidak ditemukan` }, { status: 404 });
      }
      if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Stok "${product.name}" tidak mencukupi (sisa ${product.stock})` }, { status: 400 });
      }
    }

    const subtotal = items.reduce((sum, item) => {
      const product = productMap.get(item.productId)!;
      return sum + Number(product.price) * item.quantity;
    }, 0);

    let discountAmount = 0;
    let shippingCost = subtotal >= 200000 ? 0 : 15000;
    let appliedPromo: typeof promotions.$inferSelect | null = null;

    if (promoCode) {
      const [promo] = await db
        .select()
        .from(promotions)
        .where(eq(promotions.code, promoCode.toUpperCase()))
        .limit(1);

      if (promo && promo.isActive) {
        const now = new Date();
        const withinDate = now >= new Date(promo.startDate) && now <= new Date(promo.endDate);
        const withinLimit = !promo.usageLimit || promo.usedCount < promo.usageLimit;
        const meetsMin = !promo.minPurchase || subtotal >= Number(promo.minPurchase);

        if (withinDate && withinLimit && meetsMin) {
          appliedPromo = promo;
          if (promo.type === "percentage") {
            discountAmount = (subtotal * Number(promo.value)) / 100;
            if (promo.maxDiscount) discountAmount = Math.min(discountAmount, Number(promo.maxDiscount));
          } else if (promo.type === "fixed") {
            discountAmount = Number(promo.value);
          } else if (promo.type === "free_shipping") {
            shippingCost = 0;
          }
        }
      }
    }

    const grandTotal = Math.max(subtotal + shippingCost - discountAmount, 0);
    const orderNumber = generateOrderNumber();

    const [createdOrder] = await db
      .insert(orders)
      .values({
        userId: session.userId,
        orderNumber,
        status: "pending",
        totalAmount: String(subtotal),
        shippingCost: String(shippingCost),
        discountAmount: String(discountAmount),
        grandTotal: String(grandTotal),
        shippingAddress,
        paymentMethod,
        paymentStatus: "unpaid",
        notes,
      })
      .returning();

    for (const item of items) {
      const product = productMap.get(item.productId)!;
      await db.insert(orderItems).values({
        orderId: createdOrder.id,
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[0] ?? null,
        price: product.price,
        quantity: item.quantity,
        subtotal: String(Number(product.price) * item.quantity),
      });

      await db
        .update(products)
        .set({ stock: product.stock - item.quantity })
        .where(eq(products.id, product.id));
    }

    if (appliedPromo) {
      await db
        .update(promotions)
        .set({ usedCount: appliedPromo.usedCount + 1 })
        .where(eq(promotions.id, appliedPromo.id));
    }

    return NextResponse.json({ order: createdOrder }, { status: 201 });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Gagal membuat pesanan, coba lagi" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Silakan login dulu" }, { status: 401 });
  }

  const rows = await db.select().from(orders).where(eq(orders.userId, session.userId)).orderBy(desc(orders.createdAt));
  return NextResponse.json({ orders: rows });
}
