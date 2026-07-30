import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

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
});

export async function GET() {
  const rows = await db.select().from(products).orderBy(desc(products.createdAt));
  return NextResponse.json({ products: rows });
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

    const [created] = await db.insert(products).values(parsed.data).returning();
    return NextResponse.json({ product: created }, { status: 201 });
  } catch (err) {
    console.error("Create product error:", err);
    return NextResponse.json({ error: "Gagal membuat produk" }, { status: 500 });
  }
}
