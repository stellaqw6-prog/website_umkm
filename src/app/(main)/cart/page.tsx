import { Metadata } from "next";
import { CartPageClient } from "@/components/cart/cart-page";

export const metadata: Metadata = {
  title: "Keranjang Belanja",
  description: "Lihat dan kelola keranjang belanja Anda di UMKM Store.",
};

export default function CartPage() {
  return <CartPageClient />;
}
