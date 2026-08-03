import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stores } from "@/db/schema";
import { requireSeller } from "@/lib/require-admin";

const storeSchema = z.object({
  name: z.string().min(2, "Nama toko minimal 2 karakter").optional(),
  description: z.string().optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
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
