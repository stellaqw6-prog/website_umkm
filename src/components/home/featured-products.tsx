"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import type { ProductCardData } from "@/lib/data";

export function FeaturedProducts({ products }: { products: ProductCardData[] }) {
  if (products.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-end justify-between mb-12"
        >
          <div>
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
              Produk
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Produk Unggulan UMKM
            </h2>
            <p className="text-gray-500 mt-2">
              Koleksi produk terbaik pilihan pelanggan kami
            </p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Link href="/produk?sort=Terpopuler">
              <Button variant="outline" size="sm">Best Seller</Button>
            </Link>
            <Link href="/produk?sort=Terbaru">
              <Button variant="outline" size="sm">Terbaru</Button>
            </Link>
            <Link href="/produk">
              <Button variant="default" size="sm">Lihat Semua</Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
