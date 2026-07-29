"use client";

import { motion } from "framer-motion";
import { Plus, Search, Star, Edit, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const testimonials = [
  { id: 1, name: "Budi Santoso", role: "Pelanggan Setia", rating: 5, message: "Kualitas batiknya luar biasa, pengiriman juga cepat. Sudah langganan 2 tahun!", featured: true },
  { id: 2, name: "Anita Wijaya", role: "Reseller", rating: 5, message: "Produk selalu fresh dan packaging rapi. Cocok untuk dijual lagi.", featured: true },
  { id: 3, name: "Sari Dewi", role: "Pelanggan", rating: 4, message: "Puas dengan pelayanannya, hanya saja pengiriman ke luar Jawa agak lama.", featured: false },
  { id: 4, name: "Rahmat Hidayat", role: "Pelanggan Setia", rating: 5, message: "Kopi Gayo-nya autentik banget, aromanya kuat khas kopi Aceh asli.", featured: false },
  { id: 5, name: "Dewi Lestari", role: "Pelanggan Baru", rating: 5, message: "Pertama kali beli langsung suka, kain tenunnya halus dan motifnya indah.", featured: true },
];

export function AdminTestimonials() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testimoni</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola ulasan dan testimoni pelanggan</p>
        </div>
        <Button variant="premium">
          <Plus size={18} className="mr-2" /> Tambah Testimoni
        </Button>
      </motion.div>

      <Card>
        <CardHeader className="pb-0">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Cari testimoni..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500">{t.role}</p>
                    </div>
                  </div>
                  {t.featured && (
                    <Badge variant="premium" className="text-[10px] flex items-center gap-1">
                      <CheckCircle2 size={11} /> Unggulan
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} size={13} className={idx < t.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                  ))}
                </div>
                <p className="text-sm text-gray-600 mb-3 leading-relaxed">&ldquo;{t.message}&rdquo;</p>
                <div className="flex items-center gap-1 pt-2 border-t border-gray-50">
                  <button className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-gray-600 hover:text-blue-600 py-1.5 rounded-lg hover:bg-gray-50 transition-all">
                    <Edit size={13} /> Edit
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-gray-600 hover:text-red-600 py-1.5 rounded-lg hover:bg-gray-50 transition-all">
                    <Trash2 size={13} /> Hapus
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
