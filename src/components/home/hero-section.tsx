"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star, Shield, Truck, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-stone-950 dark:via-stone-950 dark:to-blue-950/40">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl" />

      {/* Floating elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-24 right-[20%] hidden lg:block"
      >
        <div className="glass-card p-4 rounded-2xl rotate-3">
          <Star className="text-yellow-500 fill-yellow-500" size={24} />
          <p className="text-sm font-semibold mt-1 dark:text-stone-100">4.9 Rating</p>
          <p className="text-xs text-gray-500 dark:text-stone-400">10rb+ Review</p>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-32 left-[10%] hidden lg:block"
      >
        <div className="glass-card p-4 rounded-2xl -rotate-3">
          <Truck className="text-blue-600" size={24} />
          <p className="text-sm font-semibold mt-1 dark:text-stone-100">Ongkir Transparan</p>
          <p className="text-xs text-gray-500 dark:text-stone-400">Dihitung tiap toko</p>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-semibold mb-6 dark:bg-blue-950/50 dark:text-blue-300">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                #BanggaBuatanIndonesia 🇮🇩
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-[1.05] text-gray-900 mb-6 dark:text-stone-100"
            >
              Dukung{" "}
              <span className="text-gradient">UMKM Lokal</span>
              <br />
              Indonesia Berkualitas
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg text-gray-500 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed dark:text-stone-400"
            >
              Temukan produk-produk terbaik dari pengusaha lokal Indonesia. 
              Kualitas premium dengan harga terjangkau, langsung dari tangan kreatif UMKM.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
            >
              <Link href="/produk">
                <Button variant="premium" size="xl" className="group">
                  Jelajahi Produk
                  <ArrowRight
                    size={20}
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </Button>
              </Link>
              <Link href="/tentang-kami">
                <Button variant="outline" size="xl">
                  Tentang Kami
                </Button>
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="flex flex-wrap items-center gap-6 mt-8 justify-center lg:justify-start"
            >
              {[
                { icon: Shield, label: "100% Original" },
                { icon: Truck, label: "Ongkir Transparan" },
                { icon: RotateCcw, label: "7 Hari Retur" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-500 dark:text-stone-400">
                  <item.icon size={16} className="text-blue-600" />
                  <span>{item.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Content - Product Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:flex justify-center"
          >
            <div className="relative">
              {/* Main card */}
              <div className="relative w-[400px] h-[500px] bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-2xl shadow-blue-500/30 overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-3xl" />
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center">
                  <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mb-6">
                    <span className="text-4xl">🛍️</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Produk UMKM Premium</h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-4">
                    Kualitas terbaik dari pengusaha lokal terkurasi
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} className="text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-white/60 text-xs mt-2">10,000+ Ulasan Positif</p>
                </div>
              </div>

              {/* Floating cards */}
              <motion.div
                animate={{ x: [0, 10, 0], y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-12 top-20 glass-card p-3 rounded-xl"
              >
                <p className="text-xs font-semibold dark:text-stone-100">💰 Harga Terjangkau</p>
                <p className="text-lg font-bold text-blue-600">Mulai 50rb</p>
              </motion.div>

              <motion.div
                animate={{ x: [0, -10, 0], y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-8 bottom-24 glass-card p-3 rounded-xl"
              >
                <p className="text-xs font-semibold dark:text-stone-100">⭐ Terpercaya</p>
                <p className="text-lg font-bold text-green-600">5000+ UMKM</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 50C240 100 480 0 720 50C960 100 1200 0 1440 50V100H0V50Z"
            className="fill-white dark:fill-stone-950"
          />
        </svg>
      </div>
    </section>
  );
}
