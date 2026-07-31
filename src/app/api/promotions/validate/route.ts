import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { promotions } from "@/db/schema";

const validateSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = validateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const { code, subtotal } = parsed.data;

    const [promo] = await db
      .select()
      .from(promotions)
      .where(and(eq(promotions.code, code.toUpperCase()), eq(promotions.isActive, true)))
      .limit(1);

    if (!promo) {
      return NextResponse.json({ error: "Kode promo tidak ditemukan atau tidak aktif" }, { status: 404 });
    }

    const now = new Date();
    if (now < new Date(promo.startDate) || now > new Date(promo.endDate)) {
      return NextResponse.json({ error: "Kode promo sudah tidak berlaku" }, { status: 400 });
    }

    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return NextResponse.json({ error: "Kuota kode promo sudah habis" }, { status: 400 });
    }

    if (promo.minPurchase && subtotal < Number(promo.minPurchase)) {
      return NextResponse.json(
        { error: `Minimal belanja Rp${Number(promo.minPurchase).toLocaleString("id-ID")} untuk pakai kode ini` },
        { status: 400 }
      );
    }

    let discount = 0;
    let freeShipping = false;

    if (promo.type === "percentage") {
      discount = (subtotal * Number(promo.value)) / 100;
      if (promo.maxDiscount) discount = Math.min(discount, Number(promo.maxDiscount));
    } else if (promo.type === "fixed") {
      discount = Number(promo.value);
    } else if (promo.type === "free_shipping") {
      freeShipping = true;
    }

    return NextResponse.json({
      valid: true,
      code: promo.code,
      type: promo.type,
      discount: Math.round(discount),
      freeShipping,
      description: promo.description,
    });
  } catch (err) {
    console.error("Validate promo error:", err);
    return NextResponse.json({ error: "Gagal memvalidasi kode promo" }, { status: 500 });
  }
}
