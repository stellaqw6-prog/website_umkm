import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/lib/data";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (err) {
    console.error("Get product detail error:", err);
    return NextResponse.json({ error: "Gagal memuat produk" }, { status: 500 });
  }
}
