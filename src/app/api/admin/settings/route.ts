import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { getSiteSettings } from "@/lib/data";
import { requireAdmin } from "@/lib/require-admin";

const nullableString = z
  .string()
  .nullable()
  .optional()
  .transform((v) => v ?? "");

const settingsSchema = z.object({
  siteName: z.string().min(1, "Nama website wajib diisi").optional(),
  siteDescription: nullableString,
  logo: nullableString,
  favicon: nullableString,
  primaryColor: z.string().optional(),
  phone: nullableString,
  email: z
    .union([z.string().email("Format email tidak valid"), z.literal(""), z.null()])
    .optional()
    .transform((v) => v ?? ""),
  address: nullableString,
  whatsapp: nullableString,
  facebook: nullableString,
  instagram: nullableString,
  tiktok: nullableString,
  youtube: nullableString,
  twitter: nullableString,
  googleMaps: nullableString,
  gaTrackingId: nullableString,
  metaPixelId: nullableString,
  tiktokPixelId: nullableString,
  sellerUpgradeFee: z
    .union([z.string(), z.number()])
    .transform((v) => String(v))
    .optional(),
  shippingEnabled: z.boolean().optional(),
  defaultShippingCost: z
    .union([z.string(), z.number()])
    .transform((v) => String(v))
    .optional(),
});

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const body = await req.json();
    const parsed = settingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    // Pastikan barisnya sudah ada (buat default kalau belum, ini juga tempat pertama kali disimpan)
    const current = await getSiteSettings();

    const [updated] = await db
      .update(siteSettings)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(siteSettings.id, current.id))
      .returning();

    return NextResponse.json({ settings: updated });
  } catch (err) {
    console.error("Update settings error:", err);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}
