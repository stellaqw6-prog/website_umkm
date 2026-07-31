import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { subscribers } from "@/db/schema";

const schema = z.object({ email: z.string().email("Email tidak valid") });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const existing = await db.select().from(subscribers).where(eq(subscribers.email, parsed.data.email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email ini sudah berlangganan" }, { status: 409 });
    }

    await db.insert(subscribers).values({ email: parsed.data.email });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Newsletter subscribe error:", err);
    return NextResponse.json({ error: "Gagal berlangganan, coba lagi" }, { status: 500 });
  }
}
