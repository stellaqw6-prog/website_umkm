import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { wishlists } from "@/db/schema";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    return NextResponse.json({ error: "Silakan login dulu" }, { status: 401 });
  }

  try {
    const { productId } = await params;
    await db
      .delete(wishlists)
      .where(and(eq(wishlists.userId, session.userId), eq(wishlists.productId, Number(productId))));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Remove wishlist error:", err);
    return NextResponse.json({ error: "Gagal menghapus dari wishlist" }, { status: 500 });
  }
}
