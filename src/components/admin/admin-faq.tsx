"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AdminModal } from "@/components/admin/admin-modal";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm = { question: "", answer: "", category: "", sortOrder: 0, isActive: true };

export function AdminFaq() {
  const [items, setItems] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Faq | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/admin/faqs").then((r) => r.json()).then((d) => setItems(d.faqs ?? [])).catch(() => toast.error("Gagal memuat FAQ")).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (f: Faq) => { setEditing(f); setForm({ question: f.question, answer: f.answer, category: f.category ?? "", sortOrder: f.sortOrder, isActive: f.isActive }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/admin/faqs/${editing.id}` : "/api/admin/faqs";
      const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menyimpan"); return; }
      toast.success(editing ? "FAQ diperbarui" : "FAQ ditambahkan");
      setModalOpen(false);
      load();
    } catch { toast.error("Tidak bisa terhubung ke server"); } finally { setSaving(false); }
  };

  const handleDelete = async (f: Faq) => {
    if (!confirm("Hapus pertanyaan ini?")) return;
    const res = await fetch(`/api/admin/faqs/${f.id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Gagal menghapus"); return; }
    toast.success("FAQ dihapus");
    load();
  };

  const filtered = items.filter((f) => f.question.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">FAQ</h1>
          <p className="text-gray-500 text-sm mt-1 dark:text-gray-400">Kelola pertanyaan yang sering diajukan</p>
        </div>
        <Button variant="premium" onClick={openAdd}><Plus size={18} className="mr-2" /> Tambah FAQ</Button>
      </motion.div>

      <Card>
        <CardHeader className="pb-0">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input placeholder="Cari pertanyaan..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {loading ? <div className="flex justify-center py-16 text-gray-400 dark:text-gray-500"><Loader2 className="animate-spin" size={28} /></div>
          : filtered.length === 0 ? <p className="text-center py-16 text-gray-400 text-sm dark:text-gray-500">Belum ada FAQ.</p>
          : filtered.map((faq, i) => (
            <motion.div key={faq.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="border border-gray-100 rounded-xl overflow-hidden dark:border-gray-800">
              <button onClick={() => setOpenId(openId === faq.id ? null : faq.id)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50/50 transition-colors">
                {faq.category && <Badge variant="secondary" className="text-[10px] flex-shrink-0">{faq.category}</Badge>}
                <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">{faq.question}</span>
                {!faq.isActive && <Badge variant="secondary" className="text-[10px]">Nonaktif</Badge>}
                <ChevronDown size={16} className={cn("text-gray-400 transition-transform flex-shrink-0", openId === faq.id && "rotate-180")} />
              </button>
              {openId === faq.id && (
                <div className="px-4 pb-4 pl-4">
                  <p className="text-sm text-gray-500 leading-relaxed mb-3 dark:text-gray-400">{faq.answer}</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(faq)} className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-blue-600 py-1.5 px-3 rounded-lg hover:bg-gray-50 transition-all dark:hover:bg-gray-800 dark:text-gray-400"><Edit size={13} /> Edit</button>
                    <button onClick={() => handleDelete(faq)} className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-red-600 py-1.5 px-3 rounded-lg hover:bg-gray-50 transition-all dark:hover:bg-gray-800 dark:text-gray-400"><Trash2 size={13} /> Hapus</button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit FAQ" : "Tambah FAQ"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-gray-300">Pertanyaan</label><Input required value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-gray-300">Jawaban</label><Textarea required rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} /></div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-gray-300">Kategori</label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Pemesanan, Pengiriman, dll" /></div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" /> Tampilkan di website
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
