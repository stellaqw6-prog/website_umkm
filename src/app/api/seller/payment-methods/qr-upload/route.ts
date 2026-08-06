import { NextRequest, NextResponse } from "next/server";
import { requireSeller } from "@/lib/require-admin";
import { uploadImageToImgBB } from "@/lib/imgbb";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export async function POST(req: NextRequest) {
  const auth = await requireSeller(req);
  if ("error" in auth) return auth.error;

  try {
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

    return NextResponse.json({ url: result.url });
  } catch (err) {
    console.error("Upload QRIS error:", err);
    return NextResponse.json({ error: "Gagal mengunggah gambar QR, coba lagi" }, { status: 500 });
  }
}
