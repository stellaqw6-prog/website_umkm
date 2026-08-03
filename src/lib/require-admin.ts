import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE, SessionPayload } from "@/lib/auth";

type AuthResult = { session: SessionPayload } | { error: NextResponse };

async function getSession(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return token ? await verifySessionToken(token) : null;
}

/** Admin biasa ATAU Developer boleh lewat (admin & superadmin) */
export async function requireAdmin(req: NextRequest): Promise<AuthResult> {
  const session = await getSession(req);
  const isAdmin = session && (session.role === "admin" || session.role === "superadmin");

  if (!isAdmin) {
    return { error: NextResponse.json({ error: "Akses ditolak. Login sebagai admin diperlukan." }, { status: 403 }) };
  }
  return { session };
}

/** Hanya Developer (role "superadmin") yang boleh lewat — untuk approve seller & atur role user */
export async function requireDeveloper(req: NextRequest): Promise<AuthResult> {
  const session = await getSession(req);

  if (!session || session.role !== "superadmin") {
    return { error: NextResponse.json({ error: "Akses ditolak. Fitur ini khusus Developer." }, { status: 403 }) };
  }
  return { session };
}

/** Seller (atau admin/developer untuk keperluan moderasi) yang boleh lewat */
export async function requireSeller(req: NextRequest): Promise<AuthResult> {
  const session = await getSession(req);
  const allowed = session && (session.role === "seller" || session.role === "admin" || session.role === "superadmin");

  if (!allowed) {
    return { error: NextResponse.json({ error: "Akses ditolak. Login sebagai seller diperlukan." }, { status: 403 }) };
  }
  return { session };
}
