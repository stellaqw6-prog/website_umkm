"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, ImageIcon, Edit, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AdminModal } from "@/components/admin/admin-modal";
import toast from "react-hot-toast";

interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm = { title: "", subtitle: "", image: "", link: "", sortOrder: 0, isActive: true };

export function AdminBanners() {
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/banners").then((r) => r.json()).then((d) => setItems(d.banners ?? [])).catch(() => toast.error("Gagal memuat banner")).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (b: Banner) => { setEditing(b); setForm({ title: b.title, subtitle: b.subtitle ?? "", image: b.image, link: b.link ?? "", sortOrder: b.sortOrder, isActive: b.isActive }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/admin/banners/${editing.id}` : "/api/admin/banners";
      const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menyimpan"); return; }
      toast.success(editing ? "Banner diperbarui" : "Banner ditambahkan");
      setModalOpen(false);
      load();
    } catch { toast.error("Tidak bisa terhubung ke server"); } finally { setSaving(false); }
  };

  const handleDelete = async (b: Banner) => {
    if (!confirm(`Hapus banner "${b.title}"?`)) return;
    const res = await fetch(`/api/admin/banners/${b.id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Gagal menghapus"); return; }
    toast.success("Banner dihapus");
    load();
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Banner</h1>
          <p className="text-gray-500 text-sm mt-1 dark:text-gray-400">Kelola banner promosi di halaman website</p>
        </div>
        <Button variant="premium" onClick={openAdd}><Plus size={18} className="mr-2" /> Tambah Banner</Button>
      </motion.div>

      <Card>
        <CardHeader><p className="text-sm text-gray-500 dark:text-gray-400">Banner dengan urutan (sortOrder) lebih kecil tampil lebih dulu</p></CardHeader>
        <CardContent className="space-y-3">
          {loading ? <div className="flex justify-center py-16 text-gray-400 dark:text-gray-500"><Loader2 className="animate-spin" size={28} /></div>
          : items.length === 0 ? <p className="text-center py-16 text-gray-400 text-sm dark:text-gray-500">Belum ada banner.</p>
          : items.map((banner, i) => (
            <motion.div key={banner.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4 border border-gray-100 rounded-xl p-3 hover:shadow-md transition-all dark:border-gray-800">
              <div className="w-28 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center dark:bg-gray-800">
                {banner.image ? <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" /> : <ImageIcon size={22} className="text-gray-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate dark:text-gray-100">{banner.title}</p>
                {banner.link && <span className="text-xs text-gray-400 flex items-center gap-1 truncate dark:text-gray-500"><ExternalLink size={11} /> {banner.link}</span>}
              </div>
              <Badge variant={banner.isActive ? "success" : "secondary"} className="text-[10px] flex-shrink-0">{banner.isActive ? "Tayang" : "Nonaktif"}</Badge>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(banner)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-all dark:hover:bg-gray-800 dark:text-gray-500"><Edit size={15} /></button>
                <button onClick={() => handleDelete(banner)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-all dark:hover:bg-gray-800 dark:text-gray-500"><Trash2 size={15} /></button>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Banner" : "Tambah Banner"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-gray-300">Judul</label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-gray-300">Subjudul</label><Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-gray-300">URL Gambar</label><Input required value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-gray-300">Link Tujuan</label><Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} placeholder="/promo" /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-gray-300">Urutan Tampil</label><Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} /></div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" /> Tayangkan banner ini
          </label>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="premium" className="flex-1" disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : editing ? "Simpan" : "Tambah"}</Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
