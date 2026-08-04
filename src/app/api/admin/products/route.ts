import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { products, productVariants } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

const variantSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Nama varian wajib diisi"),
  price: z.union([z.string(), z.number()]).optional().transform((v) => (v === undefined || v === "" ? undefined : String(v))),
  stock: z.union([z.string(), z.number()]).transform((v) => Number(v)).default(0),
  sku: z.string().optional(),
});

const productSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda strip"),
  description: z.string().optional(),
  price: z.union([z.string(), z.number()]).transform((v) => String(v)),
  compareAtPrice: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined || v === "" ? undefined : String(v))),
  sku: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.number().int().nullable().optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  weight: z.number().int().optional(),
  freeShipping: z.boolean().optional(),
  shippingCost: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((v) => (v === undefined || v === null || v === "" ? null : String(v))),
  variants: z.array(variantSchema).optional(),
});

export async function GET() {
  const rows = await db.select().from(products).orderBy(desc(products.createdAt));
  if (rows.length === 0) return NextResponse.json({ products: [] });

  const variantRows = await db
    .select()
    .from(productVariants)
    .where(inArray(productVariants.productId, rows.map((r) => r.id)));

  const withVariants = rows.map((p) => ({
    ...p,
    variants: variantRows
      .filter((v) => v.productId === p.id)
      .map((v) => ({ id: v.id, name: v.name, price: v.price ? Number(v.price) : null, stock: v.stock, sku: v.sku })),
  }));

  return NextResponse.json({ products: withVariants });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

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

    const { variants, ...productData } = parsed.data;

    const [created] = await db.insert(products).values(productData).returning();

    if (variants && variants.length > 0) {
      await db.insert(productVariants).values(
        variants.map((v, i) => ({
          productId: created.id,
          name: v.name,
          price: v.price,
          stock: v.stock,
          sku: v.sku || undefined,
          sortOrder: i,
        }))
      );
    }

    return NextResponse.json({ product: created }, { status: 201 });
  } catch (err) {
    console.error("Create product error:", err);
    return NextResponse.json({ error: "Gagal membuat produk" }, { status: 500 });
  }
}
