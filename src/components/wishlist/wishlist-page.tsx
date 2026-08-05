"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import { useSession } from "@/hooks/use-session";
import type { ProductCardData } from "@/lib/data";

export function WishlistPage() {
  const { user, loading: sessionLoading } = useSession();
  const [items, setItems] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) =>
        setItems(
          (data.items ?? []).map((i: ProductCardData) => ({
            ...i,
            discount: i.compareAtPrice && i.compareAtPrice > i.price ? Math.round(((i.compareAtPrice - i.price) / i.compareAtPrice) * 100) : 0,
            isNew: false,
            isBestSeller: false,
            categoryId: null,
          }))
        )
      )
      .finally(() => setLoading(false));
  }, [user, sessionLoading]);

  if (sessionLoading || loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-gray-300" size={32} /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 dark:text-stone-100">Login Diperlukan</h2>
          <p className="text-gray-500 mb-6 dark:text-stone-400">Silakan login untuk melihat wishlist Anda.</p>
          <Link href="/login?redirect=/wishlist"><Button variant="premium">Login Sekarang</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <section className="py-10 bg-gray-50 min-h-screen dark:bg-stone-900">
      <div className="container mx-auto px-4">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-gray-900 mb-8 dark:text-stone-100">
          Wishlist Saya
        </motion.h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 dark:bg-stone-900 dark:border-stone-800">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-1 dark:text-stone-100">Wishlist masih kosong</h3>
            <p className="text-gray-500 text-sm mb-6 dark:text-stone-400">Tap ikon hati di produk untuk menyimpannya di sini.</p>
            <Link href="/produk"><Button variant="premium">Jelajahi Produk</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
