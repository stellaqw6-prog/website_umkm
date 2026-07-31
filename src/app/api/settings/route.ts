import { NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/data";

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    console.error("Get public settings error:", err);
    return NextResponse.json({ error: "Gagal memuat pengaturan" }, { status: 500 });
  }
}
