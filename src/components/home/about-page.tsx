"use client";

import { motion } from "framer-motion";
import { Heart, Target, Shield, Users, Sparkles, TrendingUp } from "lucide-react";

const values = [
  { icon: Heart, title: "Peduli UMKM", desc: "Kami berkomitmen untuk mendukung pertumbuhan UMKM Indonesia melalui platform digital." },
  { icon: Shield, title: "Kualitas Terjamin", desc: "Setiap produk melewati kurasi ketat untuk memastikan kualitas terbaik untuk pelanggan." },
  { icon: Target, title: "Fokus Lokal", desc: "100% produk lokal Indonesia dari Sabang sampai Merauke." },
  { icon: Users, title: "Komunitas", desc: "Membangun ekosistem UMKM yang saling mendukung dan bertumbuh bersama." },
];

export function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50 overflow-hidden dark:from-stone-950 dark:via-stone-950 dark:to-blue-950/40">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6 dark:bg-blue-950/30 dark:text-blue-400"
            >
              <Sparkles size={16} />
              Tentang Kami
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight dark:text-stone-100"
            >
              Misi Kami:{" "}
              <span className="text-gradient">Digitalisasi UMKM</span> Indonesia
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-500 leading-relaxed dark:text-stone-400"
            >
              UMKM Store hadir sebagai jembatan antara produk UMKM berkualitas dengan pelanggan di seluruh Indonesia. 
              Kami percaya bahwa setiap UMKM memiliki potensi besar untuk berkembang dan bersaing di era digital.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white dark:bg-stone-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "2024", label: "Berdiri Sejak" },
              { value: "5,000+", label: "UMKM Aktif" },
              { value: "34", label: "Provinsi" },
              { value: "98%", label: "Kepuasan" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <div className="text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-blue-400">{stat.value}</div>
                <div className="text-gray-500 text-sm mt-1 dark:text-stone-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50/50 dark:bg-stone-900/40">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12 dark:text-stone-100"
          >
            Nilai-Nilai Kami
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center hover:shadow-lg transition-all dark:bg-stone-900"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 dark:bg-blue-950/30">
                  <v.icon className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 dark:text-stone-100">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed dark:text-stone-400">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
