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

interface ProductVariant {
  id?: number;
  name: string;
  price: string;
  stock: string;
  sku: string;
}

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
  isFeatured: boolean;
  isBestSeller: boolean;
  freeShipping: boolean;
  shippingCost: string | null;
  variants?: { id: number; name: string; price: number | null; stock: number; sku: string | null }[];
}

interface Category {
  id: number;
  name: string;
}

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  price: "",
  compareAtPrice: "",
  stock: "0",
  categoryId: "",
  images: "",
  isActive: true,
  isFeatured: false,
  isBestSeller: false,
  freeShipping: false,
  shippingCost: "",
  variants: [] as ProductVariant[],
};

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export function AdminProducts() {
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
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ])
      .then(([p, c]) => {
        setProducts(p.products ?? []);
        setCategories(c.categories ?? []);
      })
      .catch(() => toast.error("Gagal memuat produk"))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description ?? "",
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? "",
      stock: String(p.stock),
      categoryId: p.categoryId ? String(p.categoryId) : "",
      images: p.images?.[0] ?? "",
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      freeShipping: p.freeShipping,
      shippingCost: p.shippingCost ?? "",
      variants: (p.variants ?? []).map((v) => ({
        id: v.id,
        name: v.name,
        price: v.price !== null ? String(v.price) : "",
        stock: String(v.stock),
        sku: v.sku ?? "",
      })),
    });
    setModalOpen(true);
  };

  const addVariantRow = () => {
    setForm((f) => ({ ...f, variants: [...f.variants, { name: "", price: "", stock: "0", sku: "" }] }));
  };

  const updateVariantRow = (index: number, patch: Partial<ProductVariant>) => {
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    }));
  };

  const removeVariantRow = (index: number) => {
    setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        price: form.price,
        compareAtPrice: form.compareAtPrice || undefined,
        stock: Number(form.stock),
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        images: form.images ? [form.images] : [],
        isActive: form.isActive,
        isFeatured: form.isFeatured,
        isBestSeller: form.isBestSeller,
        freeShipping: form.freeShipping,
        shippingCost: form.freeShipping || !form.shippingCost ? null : form.shippingCost,
        variants: form.variants
          .filter((v) => v.name.trim().length > 0)
          .map((v) => ({
            id: v.id,
            name: v.name,
            price: v.price || undefined,
            stock: Number(v.stock) || 0,
            sku: v.sku || undefined,
          })),
      };
      const url = editing ? `/api/admin/products/${editing.id}` : "/api/admin/products";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal menyimpan produk");
        return;
      }
      toast.success(editing ? "Produk diperbarui" : "Produk ditambahkan");
      setModalOpen(false);
      loadData();
    } catch {
      toast.error("Tidak bisa terhubung ke server");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Hapus produk "${p.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal menghapus produk");
        return;
      }
      toast.success("Produk dihapus");
      loadData();
    } catch {
      toast.error("Tidak bisa terhubung ke server");
    }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">Produk</h1>
          <p className="text-gray-500 text-sm mt-1 dark:text-stone-400">Kelola produk yang dijual di toko Anda</p>
        </div>
        <Button variant="premium" onClick={openAdd}>
          <Plus size={18} className="mr-2" /> Tambah Produk
        </Button>
      </motion.div>

      <Card>
        <CardHeader className="pb-0">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-stone-500" />
            <Input placeholder="Cari produk..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex justify-center py-16 text-gray-400 dark:text-stone-500"><Loader2 className="animate-spin" size={28} /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-16 text-gray-400 text-sm dark:text-stone-500">Belum ada produk. Klik &quot;Tambah Produk&quot; untuk membuat.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-stone-800">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">Produk</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">Harga</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">Stok</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/50 dark:border-stone-800/60 dark:hover:bg-stone-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center dark:bg-stone-800">
                            {p.images?.[0] ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon size={16} className="text-gray-300" />}
                          </div>
                          <span className="font-medium text-gray-900 text-sm line-clamp-1 max-w-xs dark:text-stone-100">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900 dark:text-stone-100">{formatCurrency(Number(p.price))}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-stone-300">{p.stock}</td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Badge variant={p.isActive ? "success" : "secondary"} className="text-[10px]">{p.isActive ? "Aktif" : "Nonaktif"}</Badge>
                          {p.freeShipping ? (
                            <span className="text-[10px] text-emerald-600 font-medium">Gratis Ongkir</span>
                          ) : p.shippingCost ? (
                            <span className="text-[10px] text-gray-400 dark:text-stone-500">Ongkir {formatCurrency(Number(p.shippingCost))}</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-all dark:hover:bg-stone-800 dark:text-stone-500"><Edit size={15} /></button>
                          <button onClick={() => handleDelete(p)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-all dark:hover:bg-stone-800 dark:text-stone-500"><Trash2 size={15} /></button>
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
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Nama Produk</label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Slug (URL)</label>
            <Input required value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Deskripsi</label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Harga (Rp)</label>
              <Input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Harga Coret (opsional)</label>
              <Input type="number" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Stok</label>
              <Input required type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Kategori</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-stone-700"
              >
                <option value="">Tanpa kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">URL Gambar</label>
            <Input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="https://..." />
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-stone-300">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" /> Aktif
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-stone-300">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="rounded" /> Unggulan (tampil di beranda)
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-stone-300">
              <input type="checkbox" checked={form.isBestSeller} onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })} className="rounded" /> Best Seller
            </label>
          </div>

          <div className="border border-gray-100 rounded-xl p-3 space-y-3 bg-gray-50/50 dark:border-stone-800">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-stone-300">
              <Truck size={15} className="text-blue-600" /> Ongkir Produk Ini
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-stone-300">
              <input
                type="checkbox"
                checked={form.freeShipping}
                onChange={(e) => setForm({ ...form, freeShipping: e.target.checked })}
                className="rounded"
              />
              Gratis ongkir untuk produk ini
            </label>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block dark:text-stone-400">Biaya Ongkir Khusus (opsional)</label>
              <Input
                type="number"
                value={form.shippingCost}
                onChange={(e) => setForm({ ...form, shippingCost: e.target.value })}
                placeholder="Kosongkan = pakai ongkir default toko/platform"
                disabled={form.freeShipping}
              />
              <p className="text-[11px] text-gray-400 mt-1 dark:text-stone-500">
                Kosongkan untuk ikut ongkir toko seller (kalau produk milik seller) atau ongkir default platform (kalau produk platform).
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700 block dark:text-stone-300">Varian Produk (opsional)</label>
              <button type="button" onClick={addVariantRow} className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
                <Plus size={13} /> Tambah Varian
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-2 dark:text-stone-500">
              Contoh: &quot;Merah - L&quot;, &quot;Rasa Coklat&quot;. Kosongkan harga varian kalau ingin pakai harga produk utama di atas.
            </p>
            {form.variants.length === 0 ? (
              <p className="text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl py-4 text-center dark:text-stone-500 dark:border-stone-700">
                Belum ada varian. Produk akan dijual langsung pakai harga & stok di atas.
              </p>
            ) : (
              <div className="space-y-2">
                {form.variants.map((v, i) => (
                  <div key={v.id ?? `new-${i}`} className="grid grid-cols-12 gap-2 items-center bg-gray-50 rounded-xl p-2 dark:bg-stone-800/60">
                    <Input
                      className="col-span-4"
                      placeholder="Nama varian"
                      value={v.name}
                      onChange={(e) => updateVariantRow(i, { name: e.target.value })}
                    />
                    <Input
                      className="col-span-3"
                      type="number"
                      placeholder="Harga (opsional)"
                      value={v.price}
                      onChange={(e) => updateVariantRow(i, { price: e.target.value })}
                    />
                    <Input
                      className="col-span-2"
                      type="number"
                      placeholder="Stok"
                      value={v.stock}
                      onChange={(e) => updateVariantRow(i, { stock: e.target.value })}
                    />
                    <Input
                      className="col-span-2"
                      placeholder="SKU"
                      value={v.sku}
                      onChange={(e) => updateVariantRow(i, { sku: e.target.value })}
                    />
                    <button type="button" onClick={() => removeVariantRow(i)} className="col-span-1 flex justify-center text-gray-400 hover:text-red-600 dark:text-stone-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="premium" className="flex-1" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : editing ? "Simpan Perubahan" : "Tambah Produk"}
            </Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
