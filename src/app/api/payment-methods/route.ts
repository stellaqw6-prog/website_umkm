import { NextResponse } from "next/server";
import { getActivePaymentMethods } from "@/lib/data";

export async function GET() {
  const methods = await getActivePaymentMethods();
  return NextResponse.json({ paymentMethods: methods });
}
