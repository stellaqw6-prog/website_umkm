"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AdminModal } from "@/components/admin/admin-modal";
import toast from "react-hot-toast";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string | null;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
}

const emptyForm = { title: "", slug: "", excerpt: "", content: "", coverImage: "", category: "", isPublished: false };

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export function AdminBlog() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/blog").then((r) => r.json()).then((d) => setPosts(d.posts ?? [])).catch(() => toast.error("Gagal memuat artikel")).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p: Post) => {
    setEditing(p);
    setForm({ title: p.title, slug: p.slug, excerpt: p.excerpt ?? "", content: p.content, coverImage: p.coverImage ?? "", category: p.category ?? "", isPublished: p.isPublished });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/admin/blog/${editing.id}` : "/api/admin/blog";
      const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menyimpan"); return; }
      toast.success(editing ? "Artikel diperbarui" : "Artikel ditambahkan");
      setModalOpen(false);
      load();
    } catch { toast.error("Tidak bisa terhubung ke server"); } finally { setSaving(false); }
  };

  const handleDelete = async (p: Post) => {
    if (!confirm(`Hapus artikel "${p.title}"?`)) return;
    const res = await fetch(`/api/admin/blog/${p.id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Gagal menghapus"); return; }
    toast.success("Artikel dihapus");
    load();
  };

  const filtered = posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">Blog</h1>
          <p className="text-gray-500 text-sm mt-1 dark:text-stone-400">Kelola artikel dan konten blog Anda</p>
        </div>
        <Button variant="premium" onClick={openAdd}><Plus size={18} className="mr-2" /> Tulis Artikel</Button>
      </motion.div>

      <Card>
        <CardHeader className="pb-0">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-stone-500" />
            <Input placeholder="Cari artikel..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? <div className="flex justify-center py-16 text-gray-400 dark:text-stone-500"><Loader2 className="animate-spin" size={28} /></div>
          : filtered.length === 0 ? <p className="text-center py-16 text-gray-400 text-sm dark:text-stone-500">Belum ada artikel.</p>
          : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-stone-800">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">Judul</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">Kategori</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">Views</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((post) => (
                    <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-medium text-gray-900 text-sm max-w-xs line-clamp-1 dark:text-stone-100">{post.title}</td>
                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-stone-400">{post.category ?? "-"}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-700 dark:text-stone-300"><span className="inline-flex items-center gap-1"><Eye size={13} className="text-gray-400 dark:text-stone-500" /> {post.viewCount.toLocaleString("id")}</span></td>
                      <td className="py-3 px-4 text-center"><Badge variant={post.isPublished ? "success" : "secondary"} className="text-[10px]">{post.isPublished ? "Terbit" : "Draf"}</Badge></td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(post)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-all dark:hover:bg-stone-800 dark:text-stone-500"><Edit size={15} /></button>
                          <button onClick={() => handleDelete(post)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-all dark:hover:bg-stone-800 dark:text-stone-500"><Trash2 size={15} /></button>
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

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Artikel" : "Tulis Artikel"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Judul</label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Slug (URL)</label><Input required value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Ringkasan</label><Textarea value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} rows={2} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Isi Artikel</label><Textarea required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={6} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">URL Gambar Cover</label><Input value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} placeholder="https://..." /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Kategori</label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Tips, Inspirasi, Tren" /></div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-stone-300">
            <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="rounded" /> Terbitkan sekarang (kalau tidak, jadi draf)
          </label>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="premium" className="flex-1" disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : editing ? "Simpan" : "Simpan Artikel"}</Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
