import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  const rows = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  return NextResponse.json({ messages: rows });
}
