"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, Loader2, ExternalLink, MapPin, Phone, Mail, Package, StickyNote, Copy } from "lucide-react";
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

interface OrderDetail extends OrderRow {
  shippingAddress: string;
  customerPhone: string | null;
  trackingNumber: string | null;
  notes: string | null;
}

interface OrderItemRow {
  id: number;
  productName: string;
  productImage: string | null;
  variantName: string | null;
  price: string;
  quantity: number;
  subtotal: string;
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
  const [editing, setEditing] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [formStatus, setFormStatus] = useState("");
  const [formTracking, setFormTracking] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    fetch("/api/seller/orders").then((r) => r.json()).then((d) => setOrders(d.orders ?? [])).catch(() => toast.error("Gagal memuat pesanan")).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleCopyAddress = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Alamat disalin");
  };

  const openDetail = async (o: OrderRow) => {
    setFormStatus(o.status);
    setFormTracking("");
    setEditing(null);
    setItems([]);
    setModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/seller/orders/${o.id}`);
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal memuat detail pesanan");
        setModalOpen(false);
        return;
      }
      setEditing(data.order);
      setItems(data.items ?? []);
      setFormStatus(data.order.status);
    } catch {
      toast.error("Tidak bisa terhubung ke server");
      setModalOpen(false);
    } finally {
      setDetailLoading(false);
    }
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">Pesanan Masuk</h1>
        <p className="text-gray-500 text-sm mt-1 dark:text-stone-400">Pesanan yang berisi produk dari toko kamu</p>
      </motion.div>

      <Card>
        <CardHeader className="pb-0">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-stone-500" />
            <Input placeholder="Cari nomor pesanan atau nama pelanggan..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex justify-center py-16 text-gray-400 dark:text-stone-500"><Loader2 className="animate-spin" size={28} /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center py-16 text-gray-400 text-sm dark:text-stone-500">Belum ada pesanan masuk.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-stone-800">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">No. Pesanan</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">Pelanggan</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">Total</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">Status</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">Bayar</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-stone-400">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((o) => (
                    <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-sm font-medium text-gray-900 dark:text-stone-100">{o.orderNumber}</td>
                      <td className="py-3 px-4 text-sm text-gray-700 dark:text-stone-300">{o.customerName ?? "-"}</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900 dark:text-stone-100">{formatCurrency(Number(o.grandTotal))}</td>
                      <td className="py-3 px-4 text-center"><Badge variant={statusVariant[o.status] ?? "secondary"} className="text-[10px]">{statusLabel[o.status] ?? o.status}</Badge></td>
                      <td className="py-3 px-4 text-center"><Badge variant={o.paymentStatus === "paid" ? "success" : "secondary"} className="text-[10px]">{o.paymentStatus === "paid" ? "Lunas" : "Belum"}</Badge></td>
                      <td className="py-3 px-4 text-right">
                        <button onClick={() => openDetail(o)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-all dark:hover:bg-stone-800 dark:text-stone-500"><Eye size={15} /></button>
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
        {detailLoading || !editing ? (
          <div className="flex justify-center py-12 text-gray-400"><Loader2 className="animate-spin" size={26} /></div>
        ) : (
        <div className="space-y-4">
          {editing.paymentStatus !== "paid" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">
              Pembayaran pesanan ini masih diverifikasi oleh admin/developer. Kamu tetap bisa mulai siapkan produknya.
            </div>
          )}

          {/* Alamat pengiriman & kontak pelanggan */}
          <div className="rounded-xl border border-gray-200 p-3 space-y-2.5 dark:border-stone-700">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1.5 dark:text-stone-400"><MapPin size={13} /> Alamat Pengiriman</h4>
              <button type="button" onClick={() => handleCopyAddress(editing.shippingAddress)} className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 flex-shrink-0"><Copy size={11} /> Salin</button>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed dark:text-stone-200">{editing.shippingAddress}</p>
            <div className="pt-2 border-t border-gray-100 dark:border-stone-800 space-y-1">
              {editing.customerEmail && <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-stone-400"><Mail size={12} /> {editing.customerEmail}</div>}
              {editing.customerPhone && <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-stone-400"><Phone size={12} /> {editing.customerPhone}</div>}
            </div>
          </div>

          {/* Daftar produk */}
          {items.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1.5 dark:text-stone-400"><Package size={13} /> Produk Dipesan</h4>
              <div className="space-y-2">
                {items.map((it) => (
                  <div key={it.id} className="flex gap-2.5 text-sm items-center">
                    <img src={it.productImage ?? ""} alt={it.productName} className="w-10 h-10 object-cover rounded-lg bg-gray-100 flex-shrink-0 dark:bg-stone-800" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 line-clamp-1 dark:text-stone-100">{it.productName}</p>
                      {it.variantName && <p className="text-gray-400 text-xs dark:text-stone-500">Varian: {it.variantName}</p>}
                      <p className="text-gray-500 text-xs dark:text-stone-400">{it.quantity} x {formatCurrency(Number(it.price))}</p>
                    </div>
                    <span className="font-semibold text-gray-900 text-xs whitespace-nowrap dark:text-stone-100">{formatCurrency(Number(it.subtotal))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {editing.notes && (
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800 flex items-start gap-1.5">
              <StickyNote size={13} className="flex-shrink-0 mt-0.5" /> {editing.notes}
            </div>
          )}

          {editing.paymentProofUrl && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Bukti Transfer</label>
              <a href={editing.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="block relative group">
                <img src={editing.paymentProofUrl} alt="Bukti transfer" className="w-full max-h-48 object-contain rounded-xl border border-gray-200 bg-gray-50 dark:bg-stone-800/60 dark:border-stone-700" />
                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-all flex items-center justify-center">
                  <ExternalLink size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
              </a>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Status Pesanan</label>
            <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="w-full h-10 rounded-xl border border-gray-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-stone-700">
              {statusOptions.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Nomor Resi (opsional)</label>
            <Input value={formTracking} onChange={(e) => setFormTracking(e.target.value)} placeholder={editing.trackingNumber || "Isi jika sudah dikirim"} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button type="button" variant="premium" className="flex-1" onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="animate-spin" size={16} /> : "Simpan"}</Button>
          </div>
        </div>
        )}
      </AdminModal>
    </div>
  );
}
