import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { requireSeller } from "@/lib/require-admin";

const nullableString = z
  .string()
  .nullable()
  .optional()
  .transform((v) => v ?? "");

const storeSchema = z.object({
  name: z.string().min(2, "Nama toko minimal 2 karakter").optional(),
  description: nullableString,
  logo: nullableString,
  banner: nullableString,
  phone: nullableString,
  address: nullableString,
  shippingEnabled: z.boolean().optional(),
  shippingCost: z
    .union([z.string(), z.number(), z.null()])
    .optional()
    .transform((v) => (v === undefined || v === null || v === "" ? null : String(v))),
});

export async function GET(req: NextRequest) {
  const seller = await requireSeller(req);
  if ("error" in seller) return seller.error;

  const [store] = await db.select().from(stores).where(eq(stores.sellerId, seller.session.userId)).limit(1);
  if (!store) {
    return NextResponse.json({ error: "Toko tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ store });
}

export async function PUT(req: NextRequest) {
  const seller = await requireSeller(req);
  if ("error" in seller) return seller.error;

  try {
    const body = await req.json();
    const parsed = storeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const [updated] = await db
      .update(stores)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(stores.sellerId, seller.session.userId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Toko tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ store: updated });
  } catch (err) {
    console.error("Update store error:", err);
    return NextResponse.json({ error: "Gagal menyimpan profil toko" }, { status: 500 });
  }
}
