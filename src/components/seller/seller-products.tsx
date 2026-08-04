"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Loader2, ImageIcon, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AdminModal } from "@/components/admin/admin-modal";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  compareAtPrice: string | null;
  stock: number;
  categoryId: number | null;
  images: string[];
  isActive: boolean;
  isBestSeller: boolean;
  freeShipping: boolean;
  shippingCost: string | null;
}

interface Category { id: number; name: string; }

const emptyForm = {
  name: "", slug: "", description: "", price: "", compareAtPrice: "", stock: "0",
  categoryId: "", images: "", isActive: true, isBestSeller: false,
  freeShipping: false, shippingCost: "",
};

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export function SellerProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/seller/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([p, c]) => {
      setProducts(p.products ?? []);
      setCategories(c.categories ?? []);
    }).finally(() => setLoading(false));
  };
  useEffect(loadData, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, description: p.description ?? "", price: p.price,
      compareAtPrice: p.compareAtPrice ?? "", stock: String(p.stock),
      categoryId: p.categoryId ? String(p.categoryId) : "", images: p.images?.[0] ?? "",
      isActive: p.isActive, isBestSeller: p.isBestSeller,
      freeShipping: p.freeShipping, shippingCost: p.shippingCost ?? "",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name, slug: form.slug, description: form.description, price: form.price,
        compareAtPrice: form.compareAtPrice || undefined, stock: Number(form.stock),
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        images: form.images ? [form.images] : [], isActive: form.isActive, isBestSeller: form.isBestSeller,
        freeShipping: form.freeShipping,
        shippingCost: form.freeShipping || !form.shippingCost ? null : form.shippingCost,
      };
      const url = editing ? `/api/seller/products/${editing.id}` : "/api/seller/products";
      const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menyimpan produk"); return; }
      toast.success(editing ? "Produk diperbarui" : "Produk ditambahkan");
      setModalOpen(false);
      loadData();
    } catch { toast.error("Tidak bisa terhubung ke server"); } finally { setSaving(false); }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Hapus produk "${p.name}"?`)) return;
    const res = await fetch(`/api/seller/products/${p.id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Gagal menghapus produk"); return; }
    toast.success("Produk dihapus");
    loadData();
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produk Saya</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola produk yang dijual di toko kamu</p>
        </div>
        <Button variant="premium" onClick={openAdd}><Plus size={18} className="mr-2" /> Tambah Produk</Button>
      </motion.div>

      <Card>
        <CardHeader className="pb-0">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Cari produk..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex justify-center py-16 text-gray-400"><Loader2 className="animate-spin" size={28} /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-16 text-gray-400 text-sm">Belum ada produk. Klik &quot;Tambah Produk&quot; untuk mulai jualan.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Produk</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Harga</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Stok</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-gray-300" />}
                          </div>
                          <span className="font-medium text-gray-900 text-sm line-clamp-1 max-w-xs">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">{formatCurrency(Number(p.price))}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-700">
                        <span className={p.stock <= 5 ? "text-red-600 font-semibold" : ""}>{p.stock}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant={p.isActive ? "success" : "secondary"} className="text-[10px]">{p.isActive ? "Aktif" : "Nonaktif"}</Badge>
                          {p.freeShipping ? (
                            <span className="text-[10px] text-emerald-600 font-medium">Gratis Ongkir</span>
                          ) : p.shippingCost ? (
                            <span className="text-[10px] text-gray-400">Ongkir {formatCurrency(Number(p.shippingCost))}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-all"><Edit size={15} /></button>
                          <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-all"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Produk" : "Tambah Produk"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama Produk</label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Slug (URL)</label><Input required value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Deskripsi</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Harga (Rp)</label><Input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Harga Coret (opsional)</label><Input type="number" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">Stok</label><Input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Kategori</label>
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                <option value="">Tanpa kategori</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block">URL Gambar</label><Input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="https://..." /></div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" /> Aktif</label>
            <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.isBestSeller} onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })} className="rounded" /> Best Seller</label>
          </div>
          <p className="text-xs text-gray-400">Catatan: status &quot;Unggulan&quot; (tampil di beranda) hanya bisa diatur oleh admin platform.</p>

          <div className="border border-gray-100 rounded-xl p-3 space-y-3 bg-gray-50/50">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Truck size={15} className="text-emerald-600" /> Ongkir Produk Ini
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.freeShipping}
                onChange={(e) => setForm({ ...form, freeShipping: e.target.checked })}
                className="rounded"
              />
              Gratis ongkir untuk produk ini
            </label>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Biaya Ongkir Khusus (opsional)</label>
              <Input
                type="number"
                value={form.shippingCost}
                onChange={(e) => setForm({ ...form, shippingCost: e.target.value })}
                placeholder="Kosongkan = pakai ongkir default toko"
                disabled={form.freeShipping}
              />
              <p className="text-[11px] text-gray-400 mt-1">Kosongkan untuk ikut ongkir toko (diatur di menu Profil Toko).</p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="premium" className="flex-1" disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : editing ? "Simpan Perubahan" : "Tambah Produk"}</Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
