"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AdminModal } from "@/components/admin/admin-modal";
import toast from "react-hot-toast";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
}

const emptyForm = { name: "", slug: "", description: "", isActive: true };

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadCategories = () => {
    setLoading(true);
    fetch("/api/admin/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories ?? []))
      .catch(() => toast.error("Gagal memuat kategori"))
      .finally(() => setLoading(false));
  };

  useEffect(loadCategories, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description ?? "", isActive: cat.isActive });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal menyimpan kategori");
        return;
      }
      toast.success(editing ? "Kategori diperbarui" : "Kategori ditambahkan");
      setModalOpen(false);
      loadCategories();
    } catch {
      toast.error("Tidak bisa terhubung ke server");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Hapus kategori "${cat.name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal menghapus kategori");
        return;
      }
      toast.success("Kategori dihapus");
      loadCategories();
    } catch {
      toast.error("Tidak bisa terhubung ke server");
    }
  };

  const filtered = categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

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
        <Button variant="premium" onClick={openAdd}>
          <Plus size={18} className="mr-2" /> Tambah Kategori
        </Button>
      </motion.div>

      <Card>
        <CardHeader className="pb-0">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Cari kategori..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex justify-center py-16 text-gray-400">
              <Loader2 className="animate-spin" size={28} />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-16 text-gray-400 text-sm">Belum ada kategori. Klik &quot;Tambah Kategori&quot; untuk membuat.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((cat, i) => (
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
                  <p className="text-xs text-gray-400 mb-3">/{cat.slug}</p>
                  <div className="flex items-center gap-1 pt-3 border-t border-gray-50">
                    <button
                      onClick={() => openEdit(cat)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-gray-600 hover:text-blue-600 py-1.5 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      <Edit size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat)}
                      className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-gray-600 hover:text-red-600 py-1.5 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      <Trash2 size={13} /> Hapus
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Kategori" : "Tambah Kategori"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama Kategori</label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })}
              placeholder="Contoh: Fashion"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Slug (URL)</label>
            <Input required value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="fashion" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Deskripsi</label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
            Aktifkan kategori ini
          </label>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="premium" className="flex-1" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : editing ? "Simpan Perubahan" : "Tambah Kategori"}
            </Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
