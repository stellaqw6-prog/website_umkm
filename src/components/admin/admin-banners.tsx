"use client";

import { motion } from "framer-motion";
import { Plus, ImageIcon, Edit, Trash2, GripVertical, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const banners = [
  { id: 1, title: "Flash Sale Gajian 25%", position: "Hero Utama", link: "/promo", active: true, gradient: "from-blue-600 to-indigo-600" },
  { id: 2, title: "Koleksi Batik Terbaru", position: "Hero Utama", link: "/produk?kategori=fashion", active: true, gradient: "from-orange-500 to-red-500" },
  { id: 3, title: "Gratis Ongkir Se-Indonesia", position: "Strip Atas", link: "/promo", active: true, gradient: "from-green-500 to-emerald-500" },
  { id: 4, title: "Kopi Nusantara Pilihan", position: "Kategori Produk", link: "/produk?kategori=minuman", active: false, gradient: "from-amber-600 to-yellow-600" },
];

export function AdminBanners() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banner</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola banner promosi di halaman website</p>
        </div>
        <Button variant="premium">
          <Plus size={18} className="mr-2" /> Tambah Banner
        </Button>
      </motion.div>

      <Card>
        <CardHeader>
          <p className="text-sm text-gray-500">Seret untuk mengubah urutan tampil banner</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {banners.map((banner, i) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 border border-gray-100 rounded-xl p-3 hover:shadow-md transition-all"
            >
              <GripVertical size={16} className="text-gray-300 flex-shrink-0 cursor-grab" />

              <div className={`w-28 h-16 rounded-lg bg-gradient-to-br ${banner.gradient} flex items-center justify-center flex-shrink-0`}>
                <ImageIcon size={22} className="text-white/70" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{banner.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[10px]">{banner.position}</Badge>
                  <span className="text-xs text-gray-400 flex items-center gap-1 truncate">
                    <ExternalLink size={11} /> {banner.link}
                  </span>
                </div>
              </div>

              <Badge variant={banner.active ? "success" : "secondary"} className="text-[10px] flex-shrink-0">
                {banner.active ? "Tayang" : "Nonaktif"}
              </Badge>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-all"><Edit size={15} /></button>
                <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-all"><Trash2 size={15} /></button>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
