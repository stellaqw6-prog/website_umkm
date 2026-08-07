"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, ShieldCheck, Check, X, ExternalLink, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AdminModal } from "@/components/admin/admin-modal";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface SellerRequest {
  id: number;
  storeName: string;
  phone: string | null;
  amount: string;
  paymentMethod: string | null;
  paymentProofUrl: string | null;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  createdAt: string;
  applicantName: string | null;
  applicantEmail: string | null;
}

const statusVariant: Record<string, "warning" | "success" | "destructive"> = {
  pending: "warning", approved: "success", rejected: "destructive",
};
const statusLabel: Record<string, string> = { pending: "Menunggu", approved: "Disetujui", rejected: "Ditolak" };

export function AdminSellerRequests() {
  const [requests, setRequests] = useState<SellerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<SellerRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/seller-requests")
      .then((res) => res.json())
      .then((data) => setRequests(data.requests ?? []))
      .catch(() => toast.error("Gagal memuat permintaan"))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleApprove = async (req: SellerRequest) => {
    if (!confirm(`Setujui "${req.storeName}"? Akun pemohon akan otomatis naik jadi Seller.`)) return;
    setProcessingId(req.id);
    try {
      const res = await fetch(`/api/admin/seller-requests/${req.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menyetujui"); return; }
      toast.success(`${req.storeName} sekarang jadi Seller! 🎉`);
      load();
    } catch { toast.error("Tidak bisa terhubung ke server"); } finally { setProcessingId(null); }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setProcessingId(rejectModal.id);
    try {
      const res = await fetch(`/api/admin/seller-requests/${rejectModal.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", rejectionReason: rejectReason }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menolak"); return; }
      toast.success("Permintaan ditolak");
      setRejectModal(null);
      setRejectReason("");
      load();
    } catch { toast.error("Tidak bisa terhubung ke server"); } finally { setProcessingId(null); }
  };

  const pending = requests.filter((r) => r.status === "pending");
  const processed = requests.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 dark:text-stone-100"><ShieldCheck className="text-blue-600" size={26} /> Verifikasi Seller</h1>
        <p className="text-gray-500 text-sm mt-1 dark:text-stone-400">Khusus Developer — tinjau dan setujui permintaan upgrade jadi seller</p>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-16 text-gray-400 dark:text-stone-500"><Loader2 className="animate-spin" size={28} /></div>
      ) : (
        <>
          <Card>
            <CardHeader><p className="font-semibold text-gray-900 dark:text-stone-100">Menunggu Verifikasi ({pending.length})</p></CardHeader>
            <CardContent className="space-y-4">
              {pending.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-stone-500"><Inbox size={28} className="mb-2 opacity-40" /><p className="text-sm">Tidak ada permintaan menunggu.</p></div>
              ) : (
                pending.map((req) => (
                  <div key={req.id} className="flex flex-col md:flex-row gap-4 border border-gray-100 rounded-xl p-4 dark:border-stone-800">
                    {req.paymentProofUrl && (
                      <a href={req.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                        <img src={req.paymentProofUrl} alt="Bukti transfer" className="w-full md:w-28 h-28 object-cover rounded-lg border border-gray-200 dark:border-stone-700" />
                      </a>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-stone-100">{req.storeName}</p>
                          <p className="text-xs text-gray-500 dark:text-stone-400">{req.applicantName} · {req.applicantEmail}</p>
                          {req.phone && <p className="text-xs text-gray-500 dark:text-stone-400">{req.phone}</p>}
                        </div>
                        <Badge variant={statusVariant[req.status]} className="text-[10px] flex-shrink-0">{statusLabel[req.status]}</Badge>
                      </div>
                      <p className="text-sm text-gray-700 mt-2 font-medium dark:text-stone-300">{formatCurrency(Number(req.amount))} via {req.paymentMethod}</p>
                      <p className="text-xs text-gray-400 dark:text-stone-500">{new Date(req.createdAt).toLocaleString("id-ID")}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Button size="sm" variant="premium" onClick={() => handleApprove(req)} disabled={processingId === req.id}>
                          {processingId === req.id ? <Loader2 className="animate-spin" size={14} /> : <><Check size={14} className="mr-1" /> Setujui</>}
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30" onClick={() => setRejectModal(req)}>
                          <X size={14} className="mr-1" /> Tolak
                        </Button>
                        {req.paymentProofUrl && (
                          <a href={req.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center gap-1 ml-auto">
                            <ExternalLink size={12} /> Lihat Full
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {processed.length > 0 && (
            <Card>
              <CardHeader><p className="font-semibold text-gray-900 dark:text-stone-100">Riwayat</p></CardHeader>
              <CardContent className="space-y-2">
                {processed.map((req) => (
                  <div key={req.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-stone-100">{req.storeName}</p>
                      <p className="text-xs text-gray-400 dark:text-stone-500">{req.applicantName}</p>
                    </div>
                    <Badge variant={statusVariant[req.status]} className="text-[10px]">{statusLabel[req.status]}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}

      <AdminModal open={!!rejectModal} onClose={() => setRejectModal(null)} title={`Tolak Permintaan "${rejectModal?.storeName ?? ""}"`}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Alasan Penolakan (opsional, akan dilihat pemohon)</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:border-stone-700"
              placeholder="Contoh: bukti transfer tidak jelas, silakan upload ulang"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setRejectModal(null)}>Batal</Button>
            <Button variant="destructive" className="flex-1" onClick={handleReject} disabled={processingId === rejectModal?.id}>
              {processingId === rejectModal?.id ? <Loader2 className="animate-spin" size={16} /> : "Tolak Permintaan"}
            </Button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
