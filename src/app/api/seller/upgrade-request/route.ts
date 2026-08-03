import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { sellerUpgradeRequests } from "@/db/schema";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { getSiteSettings } from "@/lib/data";
import { uploadImageToImgBB } from "@/lib/imgbb";

async function getSession(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return token ? await verifySessionToken(token) : null;
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Silakan login dulu" }, { status: 401 });
  }

  const [latest] = await db
    .select()
    .from(sellerUpgradeRequests)
    .where(eq(sellerUpgradeRequests.userId, session.userId))
    .orderBy(desc(sellerUpgradeRequests.createdAt))
    .limit(1);

  return NextResponse.json({ request: latest ?? null, currentRole: session.role });
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: "Silakan login dulu untuk mengajukan jadi seller" }, { status: 401 });
  }

  if (session.role === "seller" || session.role === "admin" || session.role === "superadmin") {
    return NextResponse.json({ error: "Akun Anda sudah punya akses lebih dari customer" }, { status: 400 });
  }

  try {
    const existingPending = await db
      .select()
      .from(sellerUpgradeRequests)
      .where(and(eq(sellerUpgradeRequests.userId, session.userId), eq(sellerUpgradeRequests.status, "pending")))
      .limit(1);

    if (existingPending.length > 0) {
      return NextResponse.json({ error: "Kamu sudah punya permintaan yang sedang diproses. Tunggu diverifikasi dulu ya." }, { status: 409 });
    }

    const formData = await req.formData();
    const storeName = formData.get("storeName")?.toString().trim();
    const phone = formData.get("phone")?.toString().trim();
    const paymentMethod = formData.get("paymentMethod")?.toString().trim();
    const file = formData.get("file");

    if (!storeName || storeName.length < 3) {
      return NextResponse.json({ error: "Nama toko minimal 3 karakter" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Bukti transfer wajib diupload" }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const uploadResult = await uploadImageToImgBB(base64);
    if ("error" in uploadResult) {
      return NextResponse.json({ error: uploadResult.error }, { status: 502 });
    }

    const settings = await getSiteSettings();

    const [created] = await db
      .insert(sellerUpgradeRequests)
      .values({
        userId: session.userId,
        storeName,
        phone,
        amount: settings.sellerUpgradeFee,
        paymentMethod,
        paymentProofUrl: uploadResult.url,
        status: "pending",
      })
      .returning();

    return NextResponse.json({ request: created }, { status: 201 });
  } catch (err) {
    console.error("Seller upgrade request error:", err);
    return NextResponse.json({ error: "Gagal mengirim permintaan, coba lagi" }, { status: 500 });
  }
}
