import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { sellerUpgradeRequests, users } from "@/db/schema";
import { requireDeveloper } from "@/lib/require-admin";

export async function GET(req: NextRequest) {
  const dev = await requireDeveloper(req);
  if ("error" in dev) return dev.error;

  const rows = await db
    .select({
      id: sellerUpgradeRequests.id,
      storeName: sellerUpgradeRequests.storeName,
      phone: sellerUpgradeRequests.phone,
      amount: sellerUpgradeRequests.amount,
      paymentMethod: sellerUpgradeRequests.paymentMethod,
      paymentProofUrl: sellerUpgradeRequests.paymentProofUrl,
      status: sellerUpgradeRequests.status,
      rejectionReason: sellerUpgradeRequests.rejectionReason,
      createdAt: sellerUpgradeRequests.createdAt,
      applicantName: users.name,
      applicantEmail: users.email,
      userId: sellerUpgradeRequests.userId,
    })
    .from(sellerUpgradeRequests)
    .leftJoin(users, eq(sellerUpgradeRequests.userId, users.id))
    .orderBy(desc(sellerUpgradeRequests.createdAt));

  return NextResponse.json({ requests: rows });
}
