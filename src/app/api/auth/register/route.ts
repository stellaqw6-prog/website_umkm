import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { checkRateLimit, getClientKey } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const rateLimit = checkRateLimit(getClientKey(req, "register"), 5, 300); // 5 pendaftaran per 5 menit per IP
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: `Terlalu banyak percobaan pendaftaran. Coba lagi dalam ${rateLimit.retryAfterSeconds} detik.` },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = parsed.data;

    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({ name, email, passwordHash, phone, role: "customer" })
      .returning();

    const token = await createSessionToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    const res = NextResponse.json({
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
