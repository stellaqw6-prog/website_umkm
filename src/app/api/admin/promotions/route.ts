import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { promotions } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

const promotionSchema = z.object({
  code: z
    .string()
    .min(3, "Kode minimal 3 karakter")
    .transform((v) => v.toUpperCase()),
  type: z.enum(["percentage", "fixed", "free_shipping"]),
  value: z.union([z.string(), z.number()]).transform((v) => String(v)),
  minPurchase: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === undefined || v === "" ? undefined : String(v))),
  usageLimit: z.number().int().optional(),
  startDate: z.string(),
  endDate: z.string(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  const rows = await db.select().from(promotions);
  return NextResponse.json({ promotions: rows });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const body = await req.json();
    const parsed = promotionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const existing = await db.select().from(promotions).where(eq(promotions.code, parsed.data.code)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Kode promo sudah dipakai" }, { status: 409 });
    }

    const [created] = await db
      .insert(promotions)
      .values({
        ...parsed.data,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
      })
      .returning();

    return NextResponse.json({ promotion: created }, { status: 201 });
  } catch (err) {
    console.error("Create promotion error:", err);
    return NextResponse.json({ error: "Gagal membuat promo" }, { status: 500 });
  }
}
