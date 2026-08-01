import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { reviews, products, orders, orderItems } from "@/db/schema";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

const reviewSchema = z.object({
  productId: z.number(),
  rating: z.number().int().min(1).max(5),
  content: z.string().min(5, "Ulasan minimal 5 karakter"),
});

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Silakan login dulu untuk memberi ulasan" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }
    const { productId, rating, content } = parsed.data;

    // Pastikan user memang pernah membeli produk ini (bukan sekadar pesanan pending/batal)
    const purchaseRows = await db
      .select({ id: orders.id })
      .from(orders)
      .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
      .where(
        and(
          eq(orders.userId, session.userId),
          eq(orderItems.productId, productId),
          ne(orders.status, "cancelled"),
          ne(orders.status, "pending")
        )
      )
      .limit(1);

    if (purchaseRows.length === 0) {
      return NextResponse.json(
        { error: "Anda hanya bisa mengulas produk yang sudah pernah dibeli dan pesanannya sudah dikonfirmasi" },
        { status: 403 }
      );
    }

    const existingReview = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.userId, session.userId), eq(reviews.productId, productId)))
      .limit(1);

    if (existingReview.length > 0) {
      return NextResponse.json({ error: "Anda sudah pernah memberi ulasan untuk produk ini" }, { status: 409 });
    }

    await db.insert(reviews).values({ productId, userId: session.userId, rating, content });

    // Hitung ulang rating rata-rata & jumlah ulasan, simpan ke tabel produk
    const [agg] = await db
      .select({
        avgRating: sql<string>`avg(${reviews.rating})`,
        count: sql<number>`count(*)`,
      })
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.isActive, true)));

    await db
      .update(products)
      .set({ rating: Number(agg.avgRating).toFixed(2), reviewCount: Number(agg.count) })
      .where(eq(products.id, productId));

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Create review error:", err);
    return NextResponse.json({ error: "Gagal mengirim ulasan" }, { status: 500 });
  }
}
