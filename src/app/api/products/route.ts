import { NextRequest, NextResponse } from "next/server";
import { getProducts, ProductFilters } from "@/lib/data";

const sortMap: Record<string, ProductFilters["sort"]> = {
  Terbaru: "terbaru",
  Terpopuler: "terpopuler",
  "Harga Terendah": "harga-terendah",
  "Harga Tertinggi": "harga-tertinggi",
  "Rating Tertinggi": "rating-tertinggi",
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") ?? undefined;
    const categorySlug = searchParams.get("kategori") ?? undefined;
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const minRating = searchParams.get("minRating") ? Number(searchParams.get("minRating")) : undefined;
    const sortLabel = searchParams.get("sort") ?? "Terbaru";
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1;

    const products = await getProducts({
      search,
      categorySlug,
      minPrice,
      maxPrice,
      minRating,
      sort: sortMap[sortLabel] ?? "terbaru",
      page,
      pageSize: 24,
    });

    return NextResponse.json({ products });
  } catch (err) {
    console.error("Get products error:", err);
    return NextResponse.json({ error: "Gagal memuat produk" }, { status: 500 });
  }
}
