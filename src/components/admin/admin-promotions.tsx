"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Copy, Edit, Trash2, Tag, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AdminModal } from "@/components/admin/admin-modal";
import toast from "react-hot-toast";

interface Promotion {
  id: number;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: string;
  minPurchase: string | null;
  usageLimit: number | null;
  usedCount: number;
  startDate: string;
  endDate: string;
  description: string | null;
  isActive: boolean;
}

const emptyForm = {
  code: "", type: "percentage" as Promotion["type"], value: "", minPurchase: "", usageLimit: "",
  startDate: "", endDate: "", description: "", isActive: true,
};

function toDateInput(d: string) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

export function AdminPromotions() {
  const [items, setItems] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/promotions").then((r) => r.json()).then((d) => setItems(d.promotions ?? [])).catch(() => toast.error("Gagal memuat promo")).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p: Promotion) => {
    setEditing(p);
    setForm({
      code: p.code, type: p.type, value: p.value, minPurchase: p.minPurchase ?? "",
      usageLimit: p.usageLimit ? String(p.usageLimit) : "", startDate: toDateInput(p.startDate),
      endDate: toDateInput(p.endDate), description: p.description ?? "", isActive: p.isActive,
    });
    setModalOpen(true);
  };

  const copyCode = (code: string) => { navigator.clipboard.writeText(code); toast.success(`Kode "${code}" disalin`); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined, minPurchase: form.minPurchase || undefined };
      const url = editing ? `/api/admin/promotions/${editing.id}` : "/api/admin/promotions";
      const res = await fetch(url, { method: editing ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menyimpan"); return; }
      toast.success(editing ? "Promo diperbarui" : "Promo ditambahkan");
      setModalOpen(false);
      load();
    } catch { toast.error("Tidak bisa terhubung ke server"); } finally { setSaving(false); }
  };

  const handleDelete = async (p: Promotion) => {
    if (!confirm(`Hapus promo "${p.code}"?`)) return;
    const res = await fetch(`/api/admin/promotions/${p.id}`, { method: "DELETE" });
    if (!res.ok) { toast.error("Gagal menghapus"); return; }
    toast.success("Promo dihapus");
    load();
  };

  const filtered = items.filter((p) => p.code.toLowerCase().includes(search.toLowerCase()));
  const typeLabel = { percentage: "Persentase", fixed: "Nominal", free_shipping: "Ongkir" };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">Promo</h1>
          <p className="text-gray-500 text-sm mt-1 dark:text-stone-400">Kelola kode voucher dan diskon</p>
        </div>
        <Button variant="premium" onClick={openAdd}><Plus size={18} className="mr-2" /> Buat Promo</Button>
      </motion.div>

      <Card>
        <CardHeader className="pb-0">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-stone-500" />
            <Input placeholder="Cari kode promo..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? <div className="flex justify-center py-16 text-gray-400 dark:text-stone-500"><Loader2 className="animate-spin" size={28} /></div>
          : filtered.length === 0 ? <p className="text-center py-16 text-gray-400 text-sm dark:text-stone-500">Belum ada promo.</p>
          : (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((promo, i) => (
                <motion.div key={promo.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all dark:border-stone-800">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0"><Tag size={18} className="text-white" /></div>
                      <div>
                        <button onClick={() => copyCode(promo.code)} className="flex items-center gap-1.5 font-mono font-bold text-gray-900 text-sm hover:text-blue-600 transition-colors dark:text-stone-100">{promo.code} <Copy size={12} /></button>
                        <p className="text-xs text-gray-500 dark:text-stone-400">{typeLabel[promo.type]} · {promo.type === "percentage" ? `${promo.value}%` : promo.type === "fixed" ? `Rp${Number(promo.value).toLocaleString("id")}` : "Gratis Ongkir"}</p>
                      </div>
                    </div>
                    <Badge variant={promo.isActive ? "success" : "secondary"} className="text-[10px] flex-shrink-0">{promo.isActive ? "Aktif" : "Nonaktif"}</Badge>
                  </div>
                  {promo.minPurchase && <p className="text-xs text-gray-500 mb-2 dark:text-stone-400">Min. pembelian Rp{Number(promo.minPurchase).toLocaleString("id")}</p>}
                  <div className="flex items-center gap-1 text-xs text-gray-400 mb-3 dark:text-stone-500"><Calendar size={12} /> {new Date(promo.startDate).toLocaleDateString("id-ID")} – {new Date(promo.endDate).toLocaleDateString("id-ID")}</div>
                  {promo.usageLimit && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1 dark:text-stone-400"><span>Terpakai</span><span>{promo.usedCount}/{promo.usageLimit}</span></div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden dark:bg-stone-800"><div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min((promo.usedCount / promo.usageLimit) * 100, 100)}%` }} /></div>
                    </div>
                  )}
                  <div className="flex items-center gap-1 pt-2 border-t border-gray-50">
                    <button onClick={() => openEdit(promo)} className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-gray-600 hover:text-blue-600 py-1.5 rounded-lg hover:bg-gray-50 transition-all dark:hover:bg-stone-800 dark:text-stone-400"><Edit size={13} /> Edit</button>
                    <button onClick={() => handleDelete(promo)} className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-gray-600 hover:text-red-600 py-1.5 rounded-lg hover:bg-gray-50 transition-all dark:hover:bg-stone-800 dark:text-stone-400"><Trash2 size={13} /> Hapus</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Promo" : "Buat Promo"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Kode Promo</label><Input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="GAJIAN25" /></div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Jenis Diskon</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Promotion["type"] })} className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-stone-700">
              <option value="percentage">Persentase (%)</option>
              <option value="fixed">Nominal (Rp)</option>
              <option value="free_shipping">Gratis Ongkir</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Nilai</label><Input required type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === "percentage" ? "25" : "50000"} /></div>
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Min. Pembelian</label><Input type="number" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: e.target.value })} /></div>
          </div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Batas Pemakaian (kosongkan jika tanpa batas)</label><Input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Mulai</label><Input required type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
            <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Berakhir</label><Input required type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
          </div>
          <div><label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Deskripsi</label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-stone-300">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" /> Aktifkan promo ini
          </label>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="premium" className="flex-1" disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : editing ? "Simpan" : "Buat Promo"}</Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
