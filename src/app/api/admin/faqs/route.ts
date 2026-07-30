import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

const faqSchema = z.object({
  question: z.string().min(5, "Pertanyaan minimal 5 karakter"),
  answer: z.string().min(5, "Jawaban minimal 5 karakter"),
  category: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  const rows = await db.select().from(faqs).orderBy(faqs.sortOrder);
  return NextResponse.json({ faqs: rows });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  try {
    const body = await req.json();
    const parsed = faqSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid" }, { status: 400 });
    }

    const [created] = await db.insert(faqs).values(parsed.data).returning();
    return NextResponse.json({ faq: created }, { status: 201 });
  } catch (err) {
    console.error("Create FAQ error:", err);
    return NextResponse.json({ error: "Gagal membuat FAQ" }, { status: 500 });
  }
}
