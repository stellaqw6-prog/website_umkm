import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { stores, storePaymentMethods } from "@/db/schema";
import { requireSeller } from "@/lib/require-admin";

const methodSchema = z.object({
  isActive: z.boolean(),
  accountNumber: z.string().optional().nullable(),
  accountName: z.string().optional().nullable(),
  qrImage: z.string().optional().nullable(),
});

const bodySchema = z.object({
  dana: methodSchema,
  qris: methodSchema,
});

async function getOwnStore(sellerId: number) {
  const [store] = await db.select().from(stores).where(eq(stores.sellerId, sellerId)).limit(1);
  return store ?? null;
}

export async function GET(req: NextRequest) {
  const auth = await requireSeller(req);
  if ("error" in auth) return auth.error;

  const store = await getOwnStore(auth.session.userId);
  if (!store) {
    return NextResponse.json({ error: "Toko tidak ditemukan" }, { status: 404 });
  }

  const rows = await db.select().from(storePaymentMethods).where(eq(storePaymentMethods.storeId, store.id));
  const dana = rows.find((r) => r.provider === "dana") ?? null;
  const qris = rows.find((r) => r.provider === "qris") ?? null;

  return NextResponse.json({
    dana: dana ?? { isActive: false, accountNumber: "", accountName: "", qrImage: null },
    qris: qris ?? { isActive: false, accountNumber: null, accountName: null, qrImage: "" },
  });
}

export async function PUT(req: NextRequest) {
  const auth = await requireSeller(req);
  if ("error" in auth) return auth.error;

  const store = await getOwnStore(auth.session.userId);
  if (!store) {
    return NextResponse.json({ error: "Toko tidak ditemukan" }, { status: 404 });
  }

  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
  }
  const { dana, qris } = parsed.data;

  if (dana.isActive && (!dana.accountNumber?.trim() || !dana.accountName?.trim())) {
    return NextResponse.json({ error: "Nomor DANA dan nama pemilik wajib diisi kalau DANA diaktifkan" }, { status: 400 });
  }
  if (qris.isActive && !qris.qrImage?.trim()) {
    return NextResponse.json({ error: "Gambar QRIS wajib diupload kalau QRIS diaktifkan" }, { status: 400 });
  }

  await db
    .insert(storePaymentMethods)
    .values({
      storeId: store.id,
      provider: "dana",
      isActive: dana.isActive,
      accountNumber: dana.accountNumber || null,
      accountName: dana.accountName || null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [storePaymentMethods.storeId, storePaymentMethods.provider],
      set: {
        isActive: dana.isActive,
        accountNumber: dana.accountNumber || null,
        accountName: dana.accountName || null,
        updatedAt: new Date(),
      },
    });

  await db
    .insert(storePaymentMethods)
    .values({
      storeId: store.id,
      provider: "qris",
      isActive: qris.isActive,
      qrImage: qris.qrImage || null,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [storePaymentMethods.storeId, storePaymentMethods.provider],
      set: {
        isActive: qris.isActive,
        qrImage: qris.qrImage || null,
        updatedAt: new Date(),
      },
    });

  return NextResponse.json({ success: true });
}
