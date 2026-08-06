import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { inArray, eq, and } from "drizzle-orm";
import { db } from "@/db";
import { stores, storePaymentMethods } from "@/db/schema";

const bodySchema = z.object({
  sellerIds: z.array(z.number().int()),
});

const PROVIDER_LABEL: Record<string, string> = {
  dana: "DANA",
  qris: "QRIS",
};

// Dipakai checkout: untuk tiap sellerId, kembalikan daftar metode pembayaran AKTIF milik toko itu
// sendiri (maksimal DANA + QRIS) — bukan metode pembayaran platform.
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }
    const { sellerIds } = parsed.data;
    if (sellerIds.length === 0) {
      return NextResponse.json({ methodsBySeller: {}, storeNameBySeller: {} });
    }

    const storeRows = await db.select().from(stores).where(inArray(stores.sellerId, sellerIds));
    const storeIds = storeRows.map((s) => s.id);
    const storeIdToSellerId = new Map(storeRows.map((s) => [s.id, s.sellerId]));
    const sellerIdToStoreName = new Map(storeRows.map((s) => [s.sellerId, s.name]));

    const methodRows =
      storeIds.length > 0
        ? await db
            .select()
            .from(storePaymentMethods)
            .where(and(inArray(storePaymentMethods.storeId, storeIds), eq(storePaymentMethods.isActive, true)))
        : [];

    const methodsBySeller: Record<
      number,
      { id: number; name: string; type: "ewallet"; provider: string; accountNumber: string; accountName: string; qrImage: string | null; instructions: string | null }[]
    > = {};
    const storeNameBySeller: Record<number, string> = {};

    for (const sellerId of sellerIds) {
      methodsBySeller[sellerId] = [];
      storeNameBySeller[sellerId] = sellerIdToStoreName.get(sellerId) ?? "Toko";
    }

    for (const row of methodRows) {
      const sellerId = storeIdToSellerId.get(row.storeId);
      if (sellerId === undefined) continue;
      methodsBySeller[sellerId].push({
        id: row.id,
        name: PROVIDER_LABEL[row.provider] ?? row.provider,
        type: "ewallet",
        provider: row.provider,
        accountNumber: row.accountNumber ?? "-",
        accountName: row.accountName ?? "-",
        qrImage: row.qrImage,
        instructions: null,
      });
    }

    return NextResponse.json({ methodsBySeller, storeNameBySeller });
  } catch (err) {
    console.error("Get store payment methods error:", err);
    return NextResponse.json({ error: "Gagal mengambil metode pembayaran toko" }, { status: 500 });
  }
}
