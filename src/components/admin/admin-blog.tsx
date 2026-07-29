"use client";

import { motion } from "framer-motion";
import { Plus, Search, Filter, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const posts = [
  { id: 1, title: "5 Tips Memilih Batik Tulis Asli Berkualitas", category: "Tips", views: 3420, published: true, date: "20 Jan 2026" },
  { id: 2, title: "Kisah Sukses Pengrajin Rotan Cirebon Go Digital", category: "Cerita UMKM", views: 2150, published: true, date: "18 Jan 2026" },
  { id: 3, title: "Manfaat Kopi Arabika Gayo untuk Kesehatan", category: "Kesehatan", views: 1890, published: true, date: "15 Jan 2026" },
  { id: 4, title: "Panduan Merawat Kain Tenun Agar Tahan Lama", category: "Tips", views: 980, published: false, date: "12 Jan 2026" },
  { id: 5, title: "Mengenal Ragam Motif Batik Nusantara", category: "Edukasi", views: 4210, published: true, date: "08 Jan 2026" },
];

export function AdminBlog() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola artikel dan konten blog Anda</p>
        </div>
        <Button variant="premium">
          <Plus size={18} className="mr-2" /> Tulis Artikel
        </Button>
      </motion.div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Cari artikel..." className="pl-9" />
            </div>
            <Button variant="outline"><Filter size={16} className="mr-2" /> Filter</Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Judul</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Views</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900 text-sm max-w-xs">{post.title}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{post.category}</td>
                    <td className="py-3 px-4 text-sm text-right text-gray-700">
                      <span className="inline-flex items-center gap-1">
                        <Eye size={13} className="text-gray-400" /> {post.views.toLocaleString("id")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={post.published ? "success" : "secondary"} className="text-[10px]">
                        {post.published ? "Terbit" : "Draf"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{post.date}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-all"><Edit size={15} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-all"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
