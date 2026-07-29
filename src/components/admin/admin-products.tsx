"use client";

import { motion } from "framer-motion";
import { Plus, Search, Filter, Download, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const products = [
  { id: 1, name: "Batik Tulis Madura Premium", sku: "BTM-001", category: "Fashion", price: 350000, stock: 45, status: "active" },
  { id: 2, name: "Keripik Singkong Balado", sku: "KSB-002", category: "Makanan", price: 25000, stock: 200, status: "active" },
  { id: 3, name: "Tas Anyaman Rotan Natural", sku: "TAR-003", category: "Kerajinan", price: 185000, stock: 12, status: "active" },
  { id: 4, name: "Kopi Arabika Gayo 250gr", sku: "KAG-004", category: "Minuman", price: 75000, stock: 0, status: "inactive" },
  { id: 5, name: "Kain Tenun NTT Premium", sku: "KTN-005", category: "Fashion", price: 450000, stock: 8, status: "active" },
];

export function AdminProducts() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produk</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola semua produk UMKM Anda</p>
        </div>
        <Button variant="premium">
          <Plus size={18} className="mr-2" /> Tambah Produk
        </Button>
      </motion.div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Cari produk..." className="pl-9" />
            </div>
            <Button variant="outline"><Filter size={16} className="mr-2" /> Filter</Button>
            <Button variant="outline"><Download size={16} className="mr-2" /> Export</Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Produk</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">SKU</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Harga</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Stok</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-400">
                          {product.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{product.sku}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{product.category}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-right">Rp {product.price.toLocaleString("id")}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-sm font-medium ${product.stock === 0 ? "text-red-600" : product.stock < 10 ? "text-yellow-600" : "text-gray-900"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={product.status === "active" ? "success" : "secondary"} className="text-[10px]">
                        {product.status === "active" ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-all"><Edit size={15} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-all"><Trash2 size={15} /></button>
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all"><MoreHorizontal size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Menampilkan 1-5 dari 50 produk</p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Sebelumnya</Button>
              <Button variant="default" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">Selanjutnya</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
