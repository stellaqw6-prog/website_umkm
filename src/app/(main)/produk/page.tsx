import { Metadata } from "next";
import { Suspense } from "react";
import { ProductsPage } from "@/components/product/products-page";

export const metadata: Metadata = {
  title: "Produk",
  description: "Jelajahi koleksi produk UMKM berkualitas dari seluruh Indonesia. Fashion, makanan, kerajinan, dan masih banyak lagi.",
  openGraph: {
    title: "Produk UMKM Berkualitas | UMKM Store",
    description: "Jelajahi koleksi produk UMKM berkualitas dari seluruh Indonesia.",
  },
};

export default function ProdukPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPage />
    </Suspense>
  );
}
