import { Metadata } from "next";
import { AdminProducts } from "@/components/admin/admin-products";

export const metadata: Metadata = { title: "Produk" };

export default function AdminProductsPage() {
  return <AdminProducts />;
}
