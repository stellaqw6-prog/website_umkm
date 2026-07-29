import { Metadata } from "next";
import { AdminOrders } from "@/components/admin/admin-orders";

export const metadata: Metadata = { title: "Pesanan" };

export default function AdminOrdersPage() {
  return <AdminOrders />;
}
