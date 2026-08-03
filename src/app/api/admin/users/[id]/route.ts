import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireDeveloper } from "@/lib/require-admin";

const roleSchema = z.object({
  role: z.enum(["customer", "seller", "admin", "superadmin"]),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const dev = await requireDeveloper(req);
  if ("error" in dev) return dev.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = roleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Role tidak valid" }, { status: 400 });
    }

    if (Number(id) === dev.session.userId && parsed.data.role !== "superadmin") {
      return NextResponse.json({ error: "Tidak bisa menurunkan role akun sendiri" }, { status: 400 });
    }

    const [updated] = await db
      .update(users)
      .set({ role: parsed.data.role, updatedAt: new Date() })
      .where(eq(users.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Update role error:", err);
    return NextResponse.json({ error: "Gagal mengubah role" }, { status: 500 });
  }
}
