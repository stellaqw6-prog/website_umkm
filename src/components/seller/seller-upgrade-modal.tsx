"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Store,
  Upload,
  Loader2,
  Clock,
  XCircle,
  Copy,
  Tag,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/hooks/use-session";
import { useSellerUpgrade } from "@/contexts/seller-upgrade-context";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  accountNumber: string;
  accountName: string;
}

interface UpgradeRequest {
  id: number;
  storeName: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  createdAt: string;
}

/**
 * Fitur "Upgrade Role Premium" (jadi seller) — sengaja dibuat SEPARATE dari
 * form login & daftar, sebagai popup tersendiri yang bisa dibuka dari mana saja
 * (mis. tombol di header) lewat SellerUpgradeProvider / useSellerUpgrade().
 */
export function SellerUpgradeModal() {
  const { isOpen, closeSellerUpgrade } = useSellerUpgrade();
  const { user, loading: sessionLoading } = useSession();

  const [fee, setFee] = useState<number | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [existingRequest, setExistingRequest] = useState<UpgradeRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/payment-methods").then((r) => r.json()),
    ]).then(([settingsData, methodsData]) => {
      setFee(Number(settingsData.settings?.sellerUpgradeFee ?? 35000));
      const nonCod = (methodsData.paymentMethods ?? []).filter((m: PaymentMethod) => m.type !== "cod");
      setMethods(nonCod);
      setSelectedMethod(nonCod[0] ?? null);
    });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || sessionLoading || !user) {
      if (!sessionLoading) setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/seller/upgrade-request")
      .then((res) => res.json())
      .then((data) => setExistingRequest(data.request))
      .finally(() => setLoading(false));
  }, [isOpen, user, sessionLoading]);

  // Reset form tiap kali popup ditutup, biar bersih saat dibuka lagi
  useEffect(() => {
    if (!isOpen) {
      setStoreName("");
      setPhone("");
      setFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Upload bukti transfer dulu");
      return;
    }
    if (!selectedMethod) {
      toast.error("Pilih metode pembayaran");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("storeName", storeName);
      formData.append("phone", phone);
      formData.append("paymentMethod", selectedMethod.name);
      formData.append("file", file);

      const res = await fetch("/api/seller/upgrade-request", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Gagal mengirim permintaan");
        return;
      }

      toast.success("Permintaan terkirim! Menunggu verifikasi developer.");
      setExistingRequest(data.request);
    } catch {
      toast.error("Tidak bisa terhubung ke server");
    } finally {
      setSubmitting(false);
    }
  };

  const copyNumber = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Disalin");
  };

  const isSellerAlready = user && (user.role === "seller" || user.role === "admin" || user.role === "superadmin");

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeSellerUpgrade}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            {/* Header popup */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                  <Sparkles size={16} />
                </div>
                <h2 className="font-bold text-gray-900">Upgrade Role Premium</h2>
              </div>
              <button onClick={closeSellerUpgrade} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="p-5">
              {sessionLoading || loading ? (
                <div className="min-h-[240px] flex items-center justify-center">
                  <Loader2 className="animate-spin text-gray-300" size={32} />
                </div>
              ) : !user ? (
                <div className="text-center py-6">
                  <Store size={40} className="mx-auto text-blue-500 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-1">Login Diperlukan</h3>
                  <p className="text-sm text-gray-500 mb-5">Silakan login terlebih dahulu untuk mengajukan upgrade role premium.</p>
                  <Link href="/login?redirect=/" onClick={closeSellerUpgrade}>
                    <Button variant="premium">Login Sekarang</Button>
                  </Link>
                </div>
              ) : isSellerAlready ? (
                <div className="text-center py-6">
                  <Store size={40} className="mx-auto text-blue-500 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-1">Kamu Sudah Punya Akses Toko</h3>
                  <p className="text-sm text-gray-500 mb-5">Akun kamu sudah berstatus {user.role === "seller" ? "seller" : "staf"}.</p>
                  {user.role === "seller" && (
                    <Link href="/seller/dashboard" onClick={closeSellerUpgrade}>
                      <Button variant="premium">Ke Dashboard Seller</Button>
                    </Link>
                  )}
                </div>
              ) : existingRequest && existingRequest.status === "pending" ? (
                <div className="text-center py-6">
                  <Clock size={40} className="mx-auto text-yellow-500 mb-3" />
                  <h3 className="font-bold text-gray-900 mb-1">Menunggu Verifikasi</h3>
                  <p className="text-sm text-gray-500">
                    Permintaan untuk toko <span className="font-semibold text-gray-700">&ldquo;{existingRequest.storeName}&rdquo;</span> sedang diperiksa developer. Kamu akan otomatis jadi seller begitu disetujui.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-4">Punya UMKM sendiri? Upgrade akunmu jadi seller dan mulai jualan di platform ini.</p>

                  {existingRequest?.status === "rejected" && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex gap-3">
                      <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-700">Permintaan sebelumnya ditolak</p>
                        {existingRequest.rejectionReason && <p className="text-xs text-red-600 mt-1">{existingRequest.rejectionReason}</p>}
                        <p className="text-xs text-red-500 mt-1">Kamu bisa ajukan ulang di bawah ini.</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 rounded-xl p-4 mb-5 text-center">
                    <p className="text-xs text-blue-600 mb-1">Biaya Upgrade Sekali Bayar</p>
                    <p className="text-2xl font-extrabold text-blue-700">{fee !== null ? formatCurrency(fee) : "..."}</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nama Toko</label>
                      <Input required minLength={3} value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Contoh: Batik Sari Ibu" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Nomor HP/WhatsApp</label>
                      <Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812xxxxxxx" />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Pilih Metode Pembayaran</label>
                      <div className="grid grid-cols-2 gap-2">
                        {methods.map((m) => (
                          <button
                            type="button"
                            key={m.id}
                            onClick={() => setSelectedMethod(m)}
                            className={`p-2.5 rounded-xl border text-sm font-medium transition-all ${
                              selectedMethod?.id === m.id ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-600 hover:border-gray-300"
                            }`}
                          >
                            {m.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {selectedMethod && (
                      <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">{selectedMethod.type === "bank" ? "No. Rekening" : "No. HP"}</p>
                          <p className="font-mono font-semibold text-gray-900">{selectedMethod.accountNumber}</p>
                          <p className="text-xs text-gray-500 mt-1">a.n. {selectedMethod.accountName}</p>
                        </div>
                        <button type="button" onClick={() => copyNumber(selectedMethod.accountNumber)} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
                          <Copy size={16} className="text-gray-500" />
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1.5 block">Upload Bukti Transfer</label>
                      <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl py-6 cursor-pointer transition-colors">
                        {previewUrl ? (
                          <img src={previewUrl} alt="preview" className="w-16 h-16 object-cover rounded-lg" />
                        ) : (
                          <Upload size={22} className="text-blue-400" />
                        )}
                        <span className="text-xs font-medium text-blue-600">{file ? file.name : "Klik untuk pilih foto bukti transfer"}</span>
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} required />
                      </label>
                    </div>

                    <Button type="submit" variant="premium" size="lg" className="w-full" disabled={submitting}>
                      {submitting ? <Loader2 className="animate-spin" size={18} /> : "Kirim Permintaan"}
                    </Button>
                    <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
                      <Tag size={11} /> Permintaan akan diverifikasi developer dalam 1-2 hari kerja
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
