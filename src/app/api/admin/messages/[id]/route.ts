import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

const updateSchema = z.object({ isRead: z.boolean() });

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const [updated] = await db
      .update(contactMessages)
      .set(parsed.data)
      .where(eq(contactMessages.id, Number(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Pesan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: updated });
  } catch (err) {
    console.error("Update message error:", err);
    return NextResponse.json({ error: "Gagal memperbarui pesan" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const { id } = await params;
    await db.delete(contactMessages).where(eq(contactMessages.id, Number(id)));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete message error:", err);
    return NextResponse.json({ error: "Gagal menghapus pesan" }, { status: 500 });
  }
}
