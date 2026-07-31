import { Metadata } from "next";
import { MyOrdersPage } from "@/components/checkout/my-orders-page";

export const metadata: Metadata = {
  title: "Pesanan Saya",
};

export default function PesananSayaPage() {
  return <MyOrdersPage />;
}
