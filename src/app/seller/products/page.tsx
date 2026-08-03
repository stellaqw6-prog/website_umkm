import { Metadata } from "next";
import { SellerProducts } from "@/components/seller/seller-products";

export const metadata: Metadata = { title: "Produk Saya" };

export default function SellerProductsPage() {
  return <SellerProducts />;
}
