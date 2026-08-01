import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { sendPasswordResetEmail } from "@/lib/email";
import { getSiteSettings } from "@/lib/data";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const rateLimit = checkRateLimit(getClientKey(req, "forgot-password"), 3, 300); // 3 permintaan per 5 menit per IP
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Terlalu banyak percobaan. Coba lagi dalam ${rateLimit.retryAfterSeconds} detik.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Email tidak valid" }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.email, parsed.data.email)).limit(1);

    // Selalu balas sukses meski email tidak ditemukan, supaya orang lain tidak bisa
    // menebak-nebak email mana saja yang terdaftar di sistem (praktik keamanan standar).
    const genericResponse = NextResponse.json({
      message: "Jika email terdaftar, link reset password sudah dikirim. Cek inbox (atau folder spam) kamu.",
    });

    if (!user) return genericResponse;

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    await db.insert(passwordResetTokens).values({ userId: user.id, token, expiresAt });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    const settings = await getSiteSettings();
    await sendPasswordResetEmail(user.email, resetUrl, settings.siteName);

    return genericResponse;
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan, coba lagi" }, { status: 500 });
  }
}
