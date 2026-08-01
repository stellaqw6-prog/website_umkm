import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { paymentMethods } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";
import { getAllPaymentMethods } from "@/lib/data";

const paymentMethodSchema = z
  .object({
    name: z.string().min(1, "Nama metode pembayaran wajib diisi"),
    type: z.enum(["ewallet", "bank", "cod"]),
    provider: z.string().min(1, "Provider wajib diisi"),
    accountNumber: z.string().optional(),
    accountName: z.string().optional(),
    qrImage: z.string().optional(),
    instructions: z.string().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  })
  .transform((data) => ({
    ...data,
    // COD tidak butuh nomor rekening/e-wallet, isi placeholder otomatis
    accountNumber: data.type === "cod" ? "-" : data.accountNumber?.trim() || "",
    accountName: data.type === "cod" ? "-" : data.accountName?.trim() || "",
  }))
  .refine((data) => data.type === "cod" || data.accountNumber.length > 0, {
    message: "Nomor HP/rekening wajib diisi",
    path: ["accountNumber"],
  })
  .refine((data) => data.type === "cod" || data.accountName.length > 0, {
    message: "Nama pemilik akun wajib diisi",
    path: ["accountName"],
  });

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  const rows = await getAllPaymentMethods();
  return NextResponse.json({ paymentMethods: rows });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const body = await req.json();
    const parsed = paymentMethodSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const [created] = await db.insert(paymentMethods).values(parsed.data).returning();
    return NextResponse.json({ paymentMethod: created }, { status: 201 });
  } catch (err) {
    console.error("Create payment method error:", err);
    return NextResponse.json({ error: "Gagal menambahkan metode pembayaran" }, { status: 500 });
  }
}
