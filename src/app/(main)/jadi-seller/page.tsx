import { Metadata } from "next";
import { JadiSellerPage } from "@/components/seller/jadi-seller-page";

export const metadata: Metadata = {
  title: "Jadi Seller",
  description: "Buka toko sendiri dan mulai jualan produk UMKM kamu di platform ini.",
};

export default function JadiSellerRoutePage() {
  return <JadiSellerPage />;
}
