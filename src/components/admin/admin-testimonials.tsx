"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Star, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AdminModal } from "@/components/admin/admin-modal";
import toast from "react-hot-toast";

interface Testimonial {
  id: number;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  isActive: boolean;
}

const emptyForm = { name: "", role: "", content: "", rating: 5, isActive: true };

export function AdminTestimonials() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/testimonials")
      .then((r) => r.json())
      .then((d) => setItems(d.testimonials ?? []))
      .catch(() => toast.error("Gagal memuat testimoni"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (t: Testimonial) => { setEditing(t); setForm({ name: t.name, role: t.role ?? "", content: t.content, rating: t.rating, isActive: t.isActive }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/admin/testimonials/${editing.id}` : "/api/admin/testimonials";
      const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menyimpan"); return; }
      toast.success(editing ? "Testimoni diperbarui" : "Testimoni ditambahkan");
      setModalOpen(false);
      load();
    } catch { toast.error("Tidak bisa terhubung ke server"); } finally { setSaving(false); }
  };

  const handleDelete = async (t: Testimonial) => {
    if (!confirm(`Hapus testimoni dari "${t.name}"?`)) return;
    const res = await fetch(`/api/admin/testimonials/${t.id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Gagal menghapus"); return; }
    toast.success("Testimoni dihapus");
    load();
  };

  const filtered = items.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Testimoni</h1>
          <p className="text-gray-500 text-sm mt-1 dark:text-gray-400">Kelola ulasan dan testimoni pelanggan</p>
        </div>
        <Button variant="premium" onClick={openAdd}><Plus size={18} className="mr-2" /> Tambah Testimoni</Button>
      </motion.div>

      <Card>
        <CardHeader className="pb-0">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input placeholder="Cari testimoni..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? <div className="flex justify-center py-16 text-gray-400 dark:text-gray-500"><Loader2 className="animate-spin" size={28} /></div>
          : filtered.length === 0 ? <p className="text-center py-16 text-gray-400 text-sm dark:text-gray-500">Belum ada testimoni.</p>
          : (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all dark:border-gray-800">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{t.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}</p>
                      </div>
                    </div>
                    <Badge variant={t.isActive ? "success" : "secondary"} className="text-[10px]">{t.isActive ? "Aktif" : "Nonaktif"}</Badge>
                  </div>
                  <div className="flex items-center gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, idx) => <Star key={idx} size={13} className={idx < t.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />)}
                  </div>
                  <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-3 dark:text-gray-400">&ldquo;{t.content}&rdquo;</p>
                  <div className="flex items-center gap-1 pt-2 border-t border-gray-50">
                    <button onClick={() => openEdit(t)} className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-gray-600 hover:text-blue-600 py-1.5 rounded-lg hover:bg-gray-50 transition-all dark:hover:bg-gray-800 dark:text-gray-400"><Edit size={13} /> Edit</button>
                    <button onClick={() => handleDelete(t)} className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-gray-600 hover:text-red-600 py-1.5 rounded-lg hover:bg-gray-50 transition-all dark:hover:bg-gray-800 dark:text-gray-400"><Trash2 size={13} /> Hapus</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Testimoni" : "Tambah Testimoni"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-gray-300">Nama</label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-gray-300">Peran (mis. Pelanggan Setia)</label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-gray-300">Isi Testimoni</label><Textarea required rows={3} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-gray-300">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((r) => (
                <button key={r} type="button" onClick={() => setForm({ ...form, rating: r })}>
                  <Star size={22} className={r <= form.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" /> Tampilkan di beranda
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
