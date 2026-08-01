import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { reviews, products, users } from "@/db/schema";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const [product] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    const rows = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        content: reviews.content,
        images: reviews.images,
        createdAt: reviews.createdAt,
        userName: users.name,
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.productId, product.id))
      .orderBy(desc(reviews.createdAt));

    const activeReviews = rows.filter((r) => r !== null);
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: activeReviews.filter((r) => r.rating === star).length,
    }));

    return NextResponse.json({ reviews: activeReviews, distribution, total: activeReviews.length });
  } catch (err) {
    console.error("Get reviews error:", err);
    return NextResponse.json({ error: "Gagal memuat ulasan" }, { status: 500 });
  }
}
