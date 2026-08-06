import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { uploadImageToImgBB } from "@/lib/imgbb";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export async function POST(req: NextRequest, { params }: { params: Promise<{ orderNumber: string }> }) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Silakan login dulu" }, { status: 401 });
  }

  try {
    const { orderNumber } = await params;
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);

    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    const isOwner = order.userId === session.userId;
    const isAdmin = session.role === "admin" || session.role === "superadmin";
    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Anda tidak punya akses ke pesanan ini" }, { status: 403 });
    }

    if (order.paymentStatus === "paid") {
      return NextResponse.json({ error: "Pesanan ini sudah lunas, tidak perlu upload bukti lagi" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File gambar wajib diupload" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Format file harus JPG, PNG, atau WEBP" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const result = await uploadImageToImgBB(base64);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 502 });
    }

    const [updated] = await db
      .update(orders)
      .set({ paymentProofUrl: result.url, paymentProofUploadedAt: new Date(), updatedAt: new Date() })
      .where(eq(orders.id, order.id))
      .returning();

    // Catatan: dulu bukti transfer otomatis disalin ke semua order "saudara" dalam satu checkout
    // gabungan, karena diasumsikan cuma ada 1x transfer untuk semuanya. Sekarang TIDAK LAGI —
    // karena tiap toko/seller punya rekening pembayaran sendiri-sendiri, jadi kalau checkout-nya
    // gabungan dari beberapa toko, pembelinya perlu transfer & upload bukti terpisah per toko.

    return NextResponse.json({ order: updated });
  } catch (err) {
    console.error("Upload payment proof error:", err);
    return NextResponse.json({ error: "Gagal mengunggah bukti transfer, coba lagi" }, { status: 500 });
  }
}
