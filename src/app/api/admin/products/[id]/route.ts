import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, notInArray } from "drizzle-orm";
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

const productUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z
    .string()
    .min(2)
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda strip")
    .optional(),
  description: z.string().optional(),
  price: z.union([z.string(), z.number()]).transform((v) => String(v)).optional(),
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
  variants: z.array(variantSchema).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { id } = await params;
    const productId = Number(id);
    const body = await req.json();
    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const { variants, ...productData } = parsed.data;

    const [updated] = await db
      .update(products)
      .set({ ...productData, updatedAt: new Date() })
      .where(eq(products.id, productId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    // Sinkronkan varian jika dikirim (tidak menyentuh varian kalau field ini tidak ada di body)
    if (variants !== undefined) {
      const keepIds = variants.filter((v) => v.id).map((v) => v.id!);

      if (keepIds.length > 0) {
        await db
          .delete(productVariants)
          .where(and(eq(productVariants.productId, productId), notInArray(productVariants.id, keepIds)));
      } else {
        await db.delete(productVariants).where(eq(productVariants.productId, productId));
      }

      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (v.id) {
          await db
            .update(productVariants)
            .set({ name: v.name, price: v.price, stock: v.stock, sku: v.sku || null, sortOrder: i, updatedAt: new Date() })
            .where(eq(productVariants.id, v.id));
        } else {
          await db.insert(productVariants).values({
            productId,
            name: v.name,
            price: v.price,
            stock: v.stock,
            sku: v.sku || undefined,
            sortOrder: i,
          });
        }
      }
    }

    return NextResponse.json({ product: updated });
  } catch (err) {
    console.error("Update product error:", err);
    return NextResponse.json({ error: "Gagal memperbarui produk" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { id } = await params;
    await db.delete(products).where(eq(products.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete product error:", err);
    return NextResponse.json({ error: "Gagal menghapus produk. Mungkin produk ini sudah pernah dipesan pelanggan." }, { status: 500 });
  }
}
