import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { hashPassword } from "@/lib/auth";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, parsed.data.token),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!resetToken) {
      return NextResponse.json({ error: "Link reset password tidak valid atau sudah kedaluwarsa" }, { status: 400 });
    }

    const passwordHash = await hashPassword(parsed.data.password);

    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, resetToken.userId));
    await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, resetToken.id));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan, coba lagi" }, { status: 500 });
  }
}
