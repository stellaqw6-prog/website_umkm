import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { wishlists, products } from "@/db/schema";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

async function getSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return token ? await verifySessionToken(token) : null;
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Silakan login dulu" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      price: products.price,
      compareAtPrice: products.compareAtPrice,
      images: products.images,
      rating: products.rating,
      reviewCount: products.reviewCount,
      stock: products.stock,
    })
    .from(wishlists)
    .innerJoin(products, eq(wishlists.productId, products.id))
    .where(eq(wishlists.userId, session.userId));

  const items = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    image: p.images?.[0] ?? "",
    rating: Number(p.rating),
    reviewCount: p.reviewCount,
    stock: p.stock,
  }));

  return NextResponse.json({ items });
}

const addSchema = z.object({ productId: z.number() });

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Silakan login dulu untuk menyimpan wishlist" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = addSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(wishlists)
      .where(and(eq(wishlists.userId, session.userId), eq(wishlists.productId, parsed.data.productId)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ added: false, message: "Sudah ada di wishlist" });
    }

    await db.insert(wishlists).values({ userId: session.userId, productId: parsed.data.productId });
    return NextResponse.json({ added: true }, { status: 201 });
  } catch (err) {
    console.error("Add wishlist error:", err);
    return NextResponse.json({ error: "Gagal menambah wishlist" }, { status: 500 });
  }
}
