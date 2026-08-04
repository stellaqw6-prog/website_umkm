import { NextResponse } from "next/server";
import { getPlatformStats } from "@/lib/data";

export async function GET() {
  try {
    const stats = await getPlatformStats();
    return NextResponse.json({ stats });
  } catch (err) {
    console.error("Get platform stats error:", err);
    return NextResponse.json({ error: "Gagal mengambil statistik" }, { status: 500 });
  }
}
