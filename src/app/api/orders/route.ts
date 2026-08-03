import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, products, productVariants, promotions, users } from "@/db/schema";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/order-utils";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getSiteSettings } from "@/lib/data";

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.number(),
        quantity: z.number().int().min(1),
        variantId: z.number().optional(),
      })
    )
    .min(1, "Keranjang kosong"),
  shippingAddress: z.string().min(10, "Alamat pengiriman minimal 10 karakter"),
  paymentMethod: z.string().min(1, "Pilih metode pembayaran"),
  notes: z.string().optional(),
  promoCode: z.string().optional(),
});

function generateCheckoutGroupId() {
  return `CKO-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

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

    const variantIds = items.map((i) => i.variantId).filter((id): id is number => !!id);
    const dbVariants = variantIds.length > 0
      ? await db.select().from(productVariants).where(inArray(productVariants.id, variantIds))
      : [];
    const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json({ error: `Produk dengan ID ${item.productId} tidak ditemukan` }, { status: 404 });
      }
      if (item.variantId) {
        const variant = variantMap.get(item.variantId);
        if (!variant || variant.productId !== item.productId) {
          return NextResponse.json({ error: `Varian produk "${product.name}" tidak ditemukan` }, { status: 404 });
        }
        if (variant.stock < item.quantity) {
          return NextResponse.json({ error: `Stok "${product.name} (${variant.name})" tidak mencukupi (sisa ${variant.stock})` }, { status: 400 });
        }
      } else if (product.stock < item.quantity) {
        return NextResponse.json({ error: `Stok "${product.name}" tidak mencukupi (sisa ${product.stock})` }, { status: 400 });
      }
    }

    const getEffectivePrice = (item: (typeof items)[number]) => {
      const product = productMap.get(item.productId)!;
      const variant = item.variantId ? variantMap.get(item.variantId) : undefined;
      return variant?.price ? Number(variant.price) : Number(product.price);
    };

    // Kelompokkan item keranjang berdasarkan seller pemilik produknya.
    // Produk tanpa seller (sellerId null) dianggap produk platform, dikelompokkan tersendiri (key "platform").
    const groups = new Map<string, { sellerId: number | null; items: typeof items }>();
    for (const item of items) {
      const product = productMap.get(item.productId)!;
      const key = product.sellerId ? String(product.sellerId) : "platform";
      const group = groups.get(key) ?? { sellerId: product.sellerId, items: [] };
      group.items.push(item);
      groups.set(key, group);
    }

    let promo: typeof promotions.$inferSelect | null = null;
    if (promoCode) {
      const [found] = await db.select().from(promotions).where(eq(promotions.code, promoCode.toUpperCase())).limit(1);
      if (found && found.isActive) {
        const now = new Date();
        const withinDate = now >= new Date(found.startDate) && now <= new Date(found.endDate);
        const withinLimit = !found.usageLimit || found.usedCount < found.usageLimit;
        if (withinDate && withinLimit) promo = found;
      }
    }

    const checkoutGroupId = groups.size > 1 ? generateCheckoutGroupId() : null;
    const createdOrders: (typeof orders.$inferSelect)[] = [];
    let promoWasUsed = false;

    const settings = await getSiteSettings();
    const [orderUser] = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

    for (const group of groups.values()) {
      const subtotal = group.items.reduce((sum, item) => sum + getEffectivePrice(item) * item.quantity, 0);

      let discountAmount = 0;
      let shippingCost = subtotal >= 200000 ? 0 : 15000;

      if (promo) {
        const meetsMin = !promo.minPurchase || subtotal >= Number(promo.minPurchase);
        if (meetsMin) {
          promoWasUsed = true;
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

      const grandTotal = Math.max(subtotal + shippingCost - discountAmount, 0);
      const orderNumber = generateOrderNumber();

      const [createdOrder] = await db
        .insert(orders)
        .values({
          userId: session.userId,
          sellerId: group.sellerId,
          checkoutGroupId,
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

      createdOrders.push(createdOrder);

      for (const item of group.items) {
        const product = productMap.get(item.productId)!;
        const variant = item.variantId ? variantMap.get(item.variantId) : undefined;
        const price = getEffectivePrice(item);

        await db.insert(orderItems).values({
          orderId: createdOrder.id,
          productId: product.id,
          productName: product.name,
          productImage: product.images?.[0] ?? null,
          variantId: variant?.id ?? null,
          variantName: variant?.name ?? null,
          price: String(price),
          quantity: item.quantity,
          subtotal: String(price * item.quantity),
        });

        if (variant) {
          await db.update(productVariants).set({ stock: variant.stock - item.quantity }).where(eq(productVariants.id, variant.id));
        } else {
          await db.update(products).set({ stock: product.stock - item.quantity }).where(eq(products.id, product.id));
        }
      }

      if (orderUser) {
        sendOrderConfirmationEmail(orderUser.email, {
          orderNumber: createdOrder.orderNumber,
          customerName: orderUser.name,
          items: group.items.map((item) => {
            const product = productMap.get(item.productId)!;
            const variant = item.variantId ? variantMap.get(item.variantId) : undefined;
            return {
              name: variant ? `${product.name} (${variant.name})` : product.name,
              quantity: item.quantity,
              price: getEffectivePrice(item),
            };
          }),
          grandTotal,
          siteName: settings.siteName,
          orderUrl: `${appUrl}/pesanan/${createdOrder.orderNumber}`,
        }).catch(() => {});
      }
    }

    if (promo && promoWasUsed) {
      await db.update(promotions).set({ usedCount: promo.usedCount + 1 }).where(eq(promotions.id, promo.id));
    }

    return NextResponse.json({ orders: createdOrders, checkoutGroupId }, { status: 201 });
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
