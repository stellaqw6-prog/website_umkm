"use client";

import { motion } from "framer-motion";
import { Users, Store, Package, Star } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import type { PlatformStats } from "@/lib/data";

interface StatsSectionProps {
  stats: PlatformStats;
}

export function StatsSection({ stats }: StatsSectionProps) {
  const items = [
    {
      icon: Store,
      value: stats.storeCount,
      suffix: "+",
      label: "UMKM Bergabung",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: Package,
      value: stats.productCount,
      suffix: "+",
      label: "Produk Tersedia",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      icon: Users,
      value: stats.customerCount,
      suffix: "+",
      label: "Pelanggan Puas",
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">
                <AnimatedCounter value={stat.value} />
                {stat.value > 0 && stat.suffix}
              </div>
              <div className="text-white/70 text-sm font-medium">{stat.label}</div>
            </motion.div>
          ))}

          {/* Rating rata-rata dipisah karena formatnya desimal (mis. 4.9), bukan angka bulat */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: items.length * 0.1 }}
            className="text-center"
          >
            <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Star className="text-yellow-600" size={24} />
            </div>
            <div className="text-3xl md:text-4xl font-extrabold text-white mb-1">
              {stats.reviewCount > 0 ? (
                <AnimatedCounter value={stats.avgRating} formatter={(n) => n.toFixed(1)} />
              ) : (
                "Baru"
              )}
            </div>
            <div className="text-white/70 text-sm font-medium">
              {stats.reviewCount > 0 ? `Rating dari ${stats.reviewCount.toLocaleString("id-ID")} ulasan` : "Belum ada ulasan"}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
