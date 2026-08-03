import { NextRequest, NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireDeveloper } from "@/lib/require-admin";

export async function GET(req: NextRequest) {
  const dev = await requireDeveloper(req);
  if ("error" in dev) return dev.error;

  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  return NextResponse.json({ users: rows });
}
