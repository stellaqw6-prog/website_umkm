"use client";

import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const categories = [
  { id: 1, name: "Fashion", slug: "fashion", products: 128, isActive: true },
  { id: 2, name: "Makanan", slug: "makanan", products: 245, isActive: true },
  { id: 3, name: "Minuman", slug: "minuman", products: 76, isActive: true },
  { id: 4, name: "Kerajinan", slug: "kerajinan", products: 92, isActive: true },
  { id: 5, name: "Kecantikan", slug: "kecantikan", products: 58, isActive: true },
  { id: 6, name: "Kesehatan", slug: "kesehatan", products: 34, isActive: false },
  { id: 7, name: "Perlengkapan Rumah", slug: "perlengkapan-rumah", products: 41, isActive: true },
];

export function AdminCategories() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategori</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola kategori produk UMKM Anda</p>
        </div>
        <Button variant="premium">
          <Plus size={18} className="mr-2" /> Tambah Kategori
        </Button>
      </motion.div>

      <Card>
        <CardHeader className="pb-0">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Cari kategori..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Package size={20} className="text-blue-600" />
                  </div>
                  <Badge variant={cat.isActive ? "success" : "secondary"} className="text-[10px]">
                    {cat.isActive ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
                <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                <p className="text-xs text-gray-400 mb-2">/{cat.slug}</p>
                <p className="text-sm text-gray-500 mb-3">{cat.products} produk</p>
                <div className="flex items-center gap-1 pt-3 border-t border-gray-50">
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
