import { Metadata } from "next";
import { SellerOrders } from "@/components/seller/seller-orders";

export const metadata: Metadata = { title: "Pesanan Masuk" };

export default function SellerOrdersPage() {
  return <SellerOrders />;
}
