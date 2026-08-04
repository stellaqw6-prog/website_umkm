import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireSeller } from "@/lib/require-admin";

const productSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda strip"),
  description: z.string().optional(),
  price: z.union([z.string(), z.number()]).transform((v) => String(v)),
  compareAtPrice: z.union([z.string(), z.number()]).optional().transform((v) => (v === undefined || v === "" ? undefined : String(v))),
  sku: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.number().int().nullable().optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  weight: z.number().int().optional(),
  freeShipping: z.boolean().optional(),
  shippingCost: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((v) => (v === undefined || v === null || v === "" ? null : String(v))),
});

export async function GET(req: NextRequest) {
  const seller = await requireSeller(req);
  if ("error" in seller) return seller.error;

  const rows = await db.select().from(products).where(eq(products.sellerId, seller.session.userId)).orderBy(desc(products.createdAt));
  return NextResponse.json({ products: rows });
}

export async function POST(req: NextRequest) {
  const seller = await requireSeller(req);
  if ("error" in seller) return seller.error;

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const existing = await db.select().from(products).where(eq(products.slug, parsed.data.slug)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Slug sudah dipakai produk lain" }, { status: 409 });
    }

    const [created] = await db
      .insert(products)
      .values({ ...parsed.data, sellerId: seller.session.userId })
      .returning();

    return NextResponse.json({ product: created }, { status: 201 });
  } catch (err) {
    console.error("Seller create product error:", err);
    return NextResponse.json({ error: "Gagal membuat produk" }, { status: 500 });
  }
}
