"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Loader2, Wallet, Landmark, QrCode, GripVertical, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AdminModal } from "@/components/admin/admin-modal";
import toast from "react-hot-toast";

interface PaymentMethod {
  id: number;
  name: string;
  type: "ewallet" | "bank" | "cod";
  provider: string;
  accountNumber: string;
  accountName: string;
  qrImage: string | null;
  instructions: string | null;
  isActive: boolean;
  sortOrder: number;
}

const emptyForm = {
  name: "",
  type: "ewallet" as "ewallet" | "bank" | "cod",
  provider: "",
  accountNumber: "",
  accountName: "",
  qrImage: "",
  instructions: "",
  isActive: true,
  sortOrder: 0,
};

const providerIcons: Record<string, string> = {
  dana: "💳",
  gopay: "🟢",
  ovo: "🟣",
  shopeepay: "🧡",
  bca: "🏦",
  mandiri: "🏦",
  bni: "🏦",
  bri: "🏦",
  qris: "🔳",
  cod: "🛵",
};

export function AdminPaymentMethods() {
  const [items, setItems] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/payment-methods")
      .then((r) => r.json())
      .then((d) => setItems(d.paymentMethods ?? []))
      .catch(() => toast.error("Gagal memuat metode pembayaran"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (m: PaymentMethod) => {
    setEditing(m);
    setForm({
      name: m.name,
      type: m.type,
      provider: m.provider,
      accountNumber: m.accountNumber,
      accountName: m.accountName,
      qrImage: m.qrImage ?? "",
      instructions: m.instructions ?? "",
      isActive: m.isActive,
      sortOrder: m.sortOrder,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editing ? `/api/admin/payment-methods/${editing.id}` : "/api/admin/payment-methods";
      const res = await fetch(url, {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal menyimpan");
        return;
      }
      toast.success(editing ? "Metode pembayaran diperbarui" : "Metode pembayaran ditambahkan");
      setModalOpen(false);
      load();
    } catch {
      toast.error("Tidak bisa terhubung ke server");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (m: PaymentMethod) => {
    const res = await fetch(`/api/admin/payment-methods/${m.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !m.isActive }),
    });
    if (!res.ok) {
      toast.error("Gagal mengubah status");
      return;
    }
    toast.success(!m.isActive ? "Metode diaktifkan" : "Metode dinonaktifkan");
    load();
  };

  const handleDelete = async (m: PaymentMethod) => {
    if (!confirm(`Hapus metode pembayaran "${m.name}"?`)) return;
    const res = await fetch(`/api/admin/payment-methods/${m.id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Gagal menghapus");
      return;
    }
    toast.success("Metode pembayaran dihapus");
    load();
  };

  const ewallets = items.filter((m) => m.type === "ewallet");
  const banks = items.filter((m) => m.type === "bank");
  const cods = items.filter((m) => m.type === "cod");

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">Metode Pembayaran</h1>
          <p className="text-gray-500 text-sm mt-1 dark:text-stone-400">
            Atur nomor e-wallet, QR code, dan rekening bank yang tampil saat pelanggan checkout
          </p>
        </div>
        <Button variant="premium" onClick={openAdd}>
          <Plus size={18} className="mr-2" /> Tambah Metode
        </Button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-24 text-gray-400 dark:text-stone-500">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        <>
          {/* E-Wallet */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2 dark:text-stone-400">
              <Wallet size={15} /> E-Wallet
            </h3>
            {ewallets.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-sm text-gray-400 dark:text-stone-500">Belum ada metode e-wallet.</CardContent></Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {ewallets.map((m, i) => (
                  <PaymentMethodCard key={m.id} m={m} i={i} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggleActive} />
                ))}
              </div>
            )}
          </div>

          {/* Bank */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2 dark:text-stone-400">
              <Landmark size={15} /> Transfer Bank
            </h3>
            {banks.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-sm text-gray-400 dark:text-stone-500">Belum ada rekening bank.</CardContent></Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {banks.map((m, i) => (
                  <PaymentMethodCard key={m.id} m={m} i={i} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggleActive} />
                ))}
              </div>
            )}
          </div>

          {/* COD */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2 dark:text-stone-400">
              <Truck size={15} /> Bayar di Tempat (COD)
            </h3>
            {cods.length === 0 ? (
              <Card><CardContent className="py-10 text-center text-sm text-gray-400 dark:text-stone-500">Belum ada metode COD.</CardContent></Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {cods.map((m, i) => (
                  <PaymentMethodCard key={m.id} m={m} i={i} onEdit={openEdit} onDelete={handleDelete} onToggle={handleToggleActive} />
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Metode Pembayaran" : "Tambah Metode Pembayaran"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Nama</label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="DANA, GoPay, Bank BCA, dll" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Tipe</label>
              <select
                className="w-full h-10 rounded-lg border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-stone-700"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "ewallet" | "bank" | "cod" })}
              >
                <option value="ewallet">E-Wallet / QRIS</option>
                <option value="bank">Transfer Bank</option>
                <option value="cod">COD (Bayar di Tempat)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Provider (kode)</label>
            <Input required value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value.toLowerCase() })} placeholder="dana / gopay / ovo / bca" />
            <p className="text-xs text-gray-400 mt-1 dark:text-stone-500">Kode singkat, huruf kecil, tanpa spasi.</p>
          </div>

          {form.type === "cod" ? (
            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 dark:bg-stone-800/60 dark:text-stone-400">
              Metode COD tidak butuh nomor rekening/e-wallet — pelanggan cukup bayar tunai ke kurir saat pesanan tiba.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">
                    {form.type === "bank" ? "Nomor Rekening" : "Nomor HP"}
                  </label>
                  <Input required value={form.accountNumber} onChange={(e) => setForm({ ...form, accountNumber: e.target.value })} placeholder={form.type === "bank" ? "0392258076" : "082326153257"} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Atas Nama</label>
                  <Input required value={form.accountName} onChange={(e) => setForm({ ...form, accountName: e.target.value })} placeholder="Nama pemilik akun" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block flex items-center gap-1 dark:text-stone-300"><QrCode size={14} /> URL Gambar QR (opsional)</label>
                <Input value={form.qrImage} onChange={(e) => setForm({ ...form, qrImage: e.target.value })} placeholder="https://... (link gambar QR code, contoh untuk QRIS)" />
              </div>
            </>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Instruksi Tambahan (opsional)</label>
            <Textarea rows={2} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Contoh: Scan QR atau kirim ke nomor di atas, lalu kirim bukti bayar ke WhatsApp admin" />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-stone-300">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
            Tampilkan di halaman checkout
          </label>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="premium" className="flex-1" disabled={saving}>
              {saving ? <Loader2 className="animate-spin" size={16} /> : editing ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

function PaymentMethodCard({
  m,
  i,
  onEdit,
  onDelete,
  onToggle,
}: {
  m: PaymentMethod;
  i: number;
  onEdit: (m: PaymentMethod) => void;
  onDelete: (m: PaymentMethod) => void;
  onToggle: (m: PaymentMethod) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg flex-shrink-0 dark:bg-stone-800/60">
                {providerIcons[m.provider] ?? <GripVertical size={18} className="text-gray-400 dark:text-stone-500" />}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 truncate dark:text-stone-100">{m.name}</p>
                <p className="text-xs text-gray-500 dark:text-stone-400">{m.accountName}</p>
              </div>
            </div>
            <Badge variant={m.isActive ? "success" : "secondary"} className="flex-shrink-0">
              {m.isActive ? "Aktif" : "Nonaktif"}
            </Badge>
          </div>

          {m.type !== "cod" && (
            <div className="bg-gray-50 rounded-xl px-3 py-2 mb-3 dark:bg-stone-800/60">
              <p className="text-xs text-gray-500 dark:text-stone-400">{m.type === "bank" ? "No. Rekening" : "No. HP"}</p>
              <p className="font-mono font-semibold text-gray-900 dark:text-stone-100">{m.accountNumber}</p>
            </div>
          )}
          {m.type === "cod" && m.instructions && (
            <div className="bg-gray-50 rounded-xl px-3 py-2 mb-3 dark:bg-stone-800/60">
              <p className="text-xs text-gray-500 leading-relaxed dark:text-stone-400">{m.instructions}</p>
            </div>
          )}

          {m.qrImage && (
            <div className="flex items-center gap-1.5 text-xs text-blue-600 mb-3">
              <QrCode size={13} /> QR code sudah diatur
            </div>
          )}

          <div className="flex items-center gap-1">
            <button onClick={() => onEdit(m)} className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-blue-600 py-1.5 px-3 rounded-lg hover:bg-gray-50 transition-all dark:hover:bg-stone-800 dark:text-stone-400">
              <Edit size={13} /> Edit
            </button>
            <button onClick={() => onToggle(m)} className="text-xs font-medium text-gray-600 hover:text-blue-600 py-1.5 px-3 rounded-lg hover:bg-gray-50 transition-all dark:hover:bg-stone-800 dark:text-stone-400">
              {m.isActive ? "Nonaktifkan" : "Aktifkan"}
            </button>
            <button onClick={() => onDelete(m)} className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-red-600 py-1.5 px-3 rounded-lg hover:bg-gray-50 transition-all dark:hover:bg-stone-800 dark:text-stone-400">
              <Trash2 size={13} /> Hapus
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
