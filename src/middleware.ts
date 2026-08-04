import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isSellerRoute = pathname.startsWith("/seller") || pathname.startsWith("/api/seller");

  // Endpoint ini khusus untuk customer MENGAJUKAN upgrade jadi seller — dia
  // justru dipakai SEBELUM user punya role seller, jadi tidak boleh ikut
  // aturan "harus sudah seller" di bawah. Validasi role-nya ditangani sendiri
  // oleh route handler (src/app/api/seller/upgrade-request/route.ts).
  const isUpgradeRequestRoute = pathname.startsWith("/api/seller/upgrade-request");

  if (!isAdminRoute && !isSellerRoute) {
    return NextResponse.next();
  }

  if (isUpgradeRequestRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isAdmin = session && (session.role === "admin" || session.role === "superadmin");
  const isSellerOrAbove = session && (session.role === "seller" || session.role === "admin" || session.role === "superadmin");

  const allowed = isAdminRoute ? isAdmin : isSellerOrAbove;

  if (!allowed) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("reason", isAdminRoute ? "admin_required" : "seller_required");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/seller/:path*", "/api/seller/:path*"],
};
