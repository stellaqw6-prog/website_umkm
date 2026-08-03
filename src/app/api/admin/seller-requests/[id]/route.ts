import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sellerUpgradeRequests, stores, users } from "@/db/schema";
import { requireDeveloper } from "@/lib/require-admin";

const decisionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  rejectionReason: z.string().optional(),
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const dev = await requireDeveloper(req);
  if ("error" in dev) return dev.error;

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = decisionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
    }

    const [requestRow] = await db.select().from(sellerUpgradeRequests).where(eq(sellerUpgradeRequests.id, Number(id))).limit(1);
    if (!requestRow) {
      return NextResponse.json({ error: "Permintaan tidak ditemukan" }, { status: 404 });
    }
    if (requestRow.status !== "pending") {
      return NextResponse.json({ error: "Permintaan ini sudah diproses sebelumnya" }, { status: 400 });
    }

    if (parsed.data.action === "reject") {
      await db
        .update(sellerUpgradeRequests)
        .set({
          status: "rejected",
          rejectionReason: parsed.data.rejectionReason ?? "Ditolak oleh developer",
          reviewedBy: dev.session.userId,
          reviewedAt: new Date(),
        })
        .where(eq(sellerUpgradeRequests.id, requestRow.id));

      return NextResponse.json({ success: true, status: "rejected" });
    }

    // Approve: buat toko + naikkan role user jadi seller
    let baseSlug = slugify(requestRow.storeName);
    let slug = baseSlug;
    let counter = 1;
    while ((await db.select().from(stores).where(eq(stores.slug, slug)).limit(1)).length > 0) {
      slug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    await db.insert(stores).values({
      sellerId: requestRow.userId,
      name: requestRow.storeName,
      slug,
      phone: requestRow.phone,
    });

    await db.update(users).set({ role: "seller", updatedAt: new Date() }).where(eq(users.id, requestRow.userId));

    await db
      .update(sellerUpgradeRequests)
      .set({ status: "approved", reviewedBy: dev.session.userId, reviewedAt: new Date() })
      .where(eq(sellerUpgradeRequests.id, requestRow.id));

    return NextResponse.json({ success: true, status: "approved" });
  } catch (err) {
    console.error("Review seller request error:", err);
    return NextResponse.json({ error: "Gagal memproses permintaan" }, { status: 500 });
  }
}
