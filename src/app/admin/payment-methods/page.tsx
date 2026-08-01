import { Metadata } from "next";
import { AdminPaymentMethods } from "@/components/admin/admin-payment-methods";

export const metadata: Metadata = { title: "Metode Pembayaran" };

export default function AdminPaymentMethodsPage() {
  return <AdminPaymentMethods />;
}
