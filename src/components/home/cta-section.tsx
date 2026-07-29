"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700" />
      <div className="absolute inset-0 bg-grid opacity-10" />

      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-semibold mb-6 backdrop-blur-sm">
            <Sparkles size={16} />
            Mulai Belanja Sekarang
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Dukung UMKM Indonesia,{" "}
            <span className="text-yellow-300">Bangga Produk Lokal!</span>
          </h2>
          <p className="text-white/80 text-lg mb-8 leading-relaxed">
            Setiap pembelian Anda berkontribusi langsung pada pertumbuhan ekonomi kerakyatan. 
            Mari bersama membangun Indonesia dari UMKM!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/produk">
              <Button
                size="xl"
                className="bg-white text-blue-700 hover:bg-gray-100 shadow-xl shadow-black/20 group"
              >
                Jelajahi Produk
                <ArrowRight
                  size={20}
                  className="ml-2 group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </Link>
            <Link href="https://wa.me/6281234567890" target="_blank">
              <Button
                size="xl"
                variant="outline"
                className="border-2 border-white/50 text-white hover:bg-white/10 bg-transparent"
              >
                Chat WhatsApp
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
