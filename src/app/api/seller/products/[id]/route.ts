import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireSeller } from "@/lib/require-admin";

const productUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan tanda strip").optional(),
  description: z.string().optional(),
  price: z.union([z.string(), z.number()]).transform((v) => String(v)).optional(),
  compareAtPrice: z.union([z.string(), z.number()]).optional().transform((v) => (v === undefined || v === "" ? undefined : String(v))),
  sku: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  categoryId: z.number().int().nullable().optional(),
  images: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isTrending: z.boolean().optional(),
  weight: z.number().int().optional(),
});

async function verifyOwnership(productId: number, sellerId: number, sellerRole: string) {
  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1);
  if (!product) return { ok: false, error: "Produk tidak ditemukan", status: 404 };

  // Admin/developer boleh moderasi produk siapa saja, seller cuma boleh produknya sendiri
  const isPrivileged = sellerRole === "admin" || sellerRole === "superadmin";
  if (!isPrivileged && product.sellerId !== sellerId) {
    return { ok: false, error: "Ini bukan produk toko kamu", status: 403 };
  }
  return { ok: true, product };
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const seller = await requireSeller(req);
  if ("error" in seller) return seller.error;

  try {
    const { id } = await params;
    const ownership = await verifyOwnership(Number(id), seller.session.userId, seller.session.role);
    if (!ownership.ok) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status });
    }

    const body = await req.json();
    const parsed = productUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const [updated] = await db
      .update(products)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(products.id, Number(id)))
      .returning();

    return NextResponse.json({ product: updated });
  } catch (err) {
    console.error("Seller update product error:", err);
    return NextResponse.json({ error: "Gagal memperbarui produk" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const seller = await requireSeller(req);
  if ("error" in seller) return seller.error;

  try {
    const { id } = await params;
    const ownership = await verifyOwnership(Number(id), seller.session.userId, seller.session.role);
    if (!ownership.ok) {
      return NextResponse.json({ error: ownership.error }, { status: ownership.status });
    }

    await db.delete(products).where(eq(products.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Seller delete product error:", err);
    return NextResponse.json({ error: "Gagal menghapus produk" }, { status: 500 });
  }
}
