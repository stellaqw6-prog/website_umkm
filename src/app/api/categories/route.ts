import { NextResponse } from "next/server";
import { getCategories } from "@/lib/data";

export async function GET() {
  try {
    const categories = await getCategories();
    return NextResponse.json({ categories });
  } catch (err) {
    console.error("Get categories error:", err);
    return NextResponse.json({ error: "Gagal memuat kategori" }, { status: 500 });
  }
}
