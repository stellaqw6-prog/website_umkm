import { Metadata } from "next";
import { OrderDetailPage } from "@/components/checkout/order-detail-page";

export const metadata: Metadata = {
  title: "Detail Pesanan",
};

export default async function PesananPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  return <OrderDetailPage orderNumber={orderNumber} />;
}
