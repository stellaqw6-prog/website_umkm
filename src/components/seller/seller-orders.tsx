"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AdminModal } from "@/components/admin/admin-modal";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface OrderRow {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentProofUrl: string | null;
  grandTotal: string;
  createdAt: string;
  customerName: string | null;
  customerEmail: string | null;
}

const statusOptions = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;
const statusLabel: Record<string, string> = {
  pending: "Menunggu Konfirmasi", confirmed: "Dikonfirmasi", processing: "Diproses",
  shipped: "Dikirim", delivered: "Selesai", cancelled: "Dibatalkan", refunded: "Refund",
};
const statusVariant: Record<string, "warning" | "default" | "success" | "destructive" | "secondary"> = {
  pending: "warning", confirmed: "default", processing: "secondary", shipped: "default",
  delivered: "success", cancelled: "destructive", refunded: "secondary",
};

export function SellerOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OrderRow | null>(null);
  const [formStatus, setFormStatus] = useState("");
  const [formTracking, setFormTracking] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/seller/orders").then((r) => r.json()).then((d) => setOrders(d.orders ?? [])).catch(() => toast.error("Gagal memuat pesanan")).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openDetail = (o: OrderRow) => {
    setEditing(o);
    setFormStatus(o.status);
    setFormTracking("");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload: Record<string, string> = { status: formStatus };
      if (formTracking) payload.trackingNumber = formTracking;
      const res = await fetch(`/api/seller/orders/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal memperbarui"); return; }
      toast.success("Status pesanan diperbarui");
      setModalOpen(false);
      load();
    } catch { toast.error("Tidak bisa terhubung ke server"); } finally { setSaving(false); }
  };

  const filtered = orders.filter((o) => o.orderNumber.toLowerCase().includes(search.toLowerCase()) || (o.customerName ?? "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900">Pesanan Masuk</h1>
        <p className="text-gray-500 text-sm mt-1">Pesanan yang berisi produk dari toko kamu</p>
      </motion.div>

      <Card>
        <CardHeader className="pb-0">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Cari nomor pesanan atau nama pelanggan..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex justify-center py-16 text-gray-400"><Loader2 className="animate-spin" size={28} /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-16 text-gray-400 text-sm">Belum ada pesanan masuk.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">No. Pesanan</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Pelanggan</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Total</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Bayar</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-sm font-medium text-gray-900">{o.orderNumber}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{o.customerName ?? "-"}</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">{formatCurrency(Number(o.grandTotal))}</td>
                      <td className="py-3 px-4 text-center"><Badge variant={statusVariant[o.status] ?? "secondary"} className="text-[10px]">{statusLabel[o.status] ?? o.status}</Badge></td>
                      <td className="py-3 px-4 text-center"><Badge variant={o.paymentStatus === "paid" ? "success" : "secondary"} className="text-[10px]">{o.paymentStatus === "paid" ? "Lunas" : "Belum"}</Badge></td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => openDetail(o)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-all"><Eye size={15} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title={`Pesanan ${editing?.orderNumber ?? ""}`}>
        <div className="space-y-4">
          {editing?.paymentStatus !== "paid" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
              Pembayaran pesanan ini masih diverifikasi oleh admin/developer. Kamu tetap bisa mulai siapkan produknya.
            </div>
          )}
          {editing?.paymentProofUrl && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Bukti Transfer</label>
              <a href={editing.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="block relative group">
                <img src={editing.paymentProofUrl} alt="Bukti transfer" className="w-full max-h-48 object-contain rounded-xl border border-gray-200 bg-gray-50" />
                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all flex items-center justify-center">
                  <ExternalLink size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </a>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Status Pesanan</label>
            <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
              {statusOptions.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nomor Resi (opsional)</label>
            <Input value={formTracking} onChange={(e) => setFormTracking(e.target.value)} placeholder="Isi jika sudah dikirim" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="button" variant="premium" className="flex-1" onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : "Simpan"}</Button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
