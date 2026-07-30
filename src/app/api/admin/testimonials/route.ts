import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { testimonials } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

const testimonialSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  role: z.string().optional(),
  content: z.string().min(5, "Isi testimoni minimal 5 karakter"),
  rating: z.number().int().min(1).max(5).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  const rows = await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
  return NextResponse.json({ testimonials: rows });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const body = await req.json();
    const parsed = testimonialSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const [created] = await db.insert(testimonials).values(parsed.data).returning();
    return NextResponse.json({ testimonial: created }, { status: 201 });
  } catch (err) {
    console.error("Create testimonial error:", err);
    return NextResponse.json({ error: "Gagal membuat testimoni" }, { status: 500 });
  }
}
