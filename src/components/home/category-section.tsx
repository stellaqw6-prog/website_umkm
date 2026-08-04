"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shirt,
  Coffee,
  UtensilsCrossed,
  Gem,
  Scissors,
  Home,
  Package,
} from "lucide-react";
import type { categories as categoriesTable } from "@/db/schema";

type Category = typeof categoriesTable.$inferSelect;

const styleByName: Record<string, { icon: typeof Shirt; color: string; bg: string }> = {
  Fashion: { icon: Shirt, color: "from-pink-500 to-rose-500", bg: "bg-pink-50 dark:bg-pink-950/40" },
  Makanan: { icon: UtensilsCrossed, color: "from-orange-500 to-red-500", bg: "bg-orange-50 dark:bg-orange-950/40" },
  Minuman: { icon: Coffee, color: "from-amber-500 to-yellow-500", bg: "bg-amber-50 dark:bg-amber-950/40" },
  Kerajinan: { icon: Scissors, color: "from-purple-500 to-violet-500", bg: "bg-purple-50 dark:bg-purple-950/40" },
  Aksesoris: { icon: Gem, color: "from-emerald-500 to-teal-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  Dekorasi: { icon: Home, color: "from-cyan-500 to-blue-500", bg: "bg-cyan-50 dark:bg-cyan-950/40" },
};

const fallbackStyle = { icon: Package, color: "from-gray-500 to-gray-600", bg: "bg-gray-50 dark:bg-gray-800" };

export function CategorySection({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="py-20 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
            Kategori
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 dark:text-gray-100">
            Jelajahi Kategori Populer
          </h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto dark:text-gray-400">
            Temukan berbagai kategori produk UMKM unggulan yang siap memenuhi kebutuhan Anda
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat, i) => {
            const style = styleByName[cat.name] ?? fallbackStyle;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  href={`/produk?kategori=${cat.slug}`}
                  className="flex flex-col items-center gap-3 p-5 rounded-2xl hover:bg-gray-50 transition-all group dark:hover:bg-gray-900"
                >
                  <div
                    className={`w-16 h-16 ${style.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <style.icon className={`bg-gradient-to-br ${style.color} bg-clip-text text-transparent`} size={28} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900 text-sm dark:text-gray-200">{cat.name}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
