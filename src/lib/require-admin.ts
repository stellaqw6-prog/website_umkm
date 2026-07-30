import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE, SessionPayload } from "@/lib/auth";

export async function requireAdmin(
  req: NextRequest
): Promise<{ session: SessionPayload } | { error: NextResponse }> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isAdmin = session && (session.role === "admin" || session.role === "superadmin");

  if (!isAdmin) {
    return {
      error: NextResponse.json({ error: "Akses ditolak. Login sebagai admin diperlukan." }, { status: 403 }),
    };
  }

  return { session };
}
