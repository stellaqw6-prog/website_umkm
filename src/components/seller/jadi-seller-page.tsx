"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Store, Upload, Loader2, CheckCircle2, Clock, XCircle, Copy, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/hooks/use-session";
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

export function JadiSellerPage() {
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
    Promise.all([
      fetch("/api/settings").then((r) => r.json()),
      fetch("/api/payment-methods").then((r) => r.json()),
    ]).then(([settingsData, methodsData]) => {
      setFee(Number(settingsData.settings?.sellerUpgradeFee ?? 35000));
      const nonCod = (methodsData.paymentMethods ?? []).filter((m: PaymentMethod) => m.type !== "cod");
      setMethods(nonCod);
      setSelectedMethod(nonCod[0] ?? null);
    });
  }, []);

  useEffect(() => {
    if (sessionLoading || !user) {
      setLoading(false);
      return;
    }
    fetch("/api/seller/upgrade-request")
      .then((res) => res.json())
      .then((data) => setExistingRequest(data.request))
      .finally(() => setLoading(false));
  }, [user, sessionLoading]);

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

  if (sessionLoading || loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="animate-spin text-gray-300" size={32} /></div>;
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 dark:text-stone-100">Login Diperlukan</h2>
          <p className="text-gray-500 mb-6 dark:text-stone-400">Silakan login untuk mengajukan jadi seller.</p>
          <Link href="/login?redirect=/jadi-seller"><Button variant="premium">Login Sekarang</Button></Link>
        </div>
      </div>
    );
  }

  if (user.role === "seller" || user.role === "admin" || user.role === "superadmin") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <Store size={48} className="mx-auto text-blue-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2 dark:text-stone-100">Kamu Sudah Punya Akses Toko</h2>
          <p className="text-gray-500 mb-6 dark:text-stone-400">Akun kamu sudah berstatus {user.role === "seller" ? "seller" : "staf"}.</p>
          {user.role === "seller" && <Link href="/seller/dashboard"><Button variant="premium">Ke Dashboard Seller</Button></Link>}
        </div>
      </div>
    );
  }

  if (existingRequest && existingRequest.status === "pending") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div className="max-w-md">
          <Clock size={48} className="mx-auto text-yellow-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2 dark:text-stone-100">Menunggu Verifikasi</h2>
          <p className="text-gray-500 dark:text-stone-400">
            Permintaan untuk toko <span className="font-semibold text-gray-700 dark:text-stone-300">&ldquo;{existingRequest.storeName}&rdquo;</span> sedang diperiksa developer. Kamu akan otomatis jadi seller begitu disetujui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 bg-gray-50 min-h-screen dark:bg-stone-800">
      <div className="container mx-auto px-4 max-w-lg">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4 dark:bg-blue-950/30">
            <Store size={28} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">Buka Toko Sendiri</h1>
          <p className="text-gray-500 mt-2 dark:text-stone-400">Punya UMKM sendiri? Daftar jadi seller dan mulai jualan di platform ini.</p>
        </motion.div>

        {existingRequest?.status === "rejected" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3 dark:bg-red-950/20 dark:border-red-900/40">
            <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5 dark:text-red-400" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">Permintaan sebelumnya ditolak</p>
              {existingRequest.rejectionReason && <p className="text-xs text-red-600 mt-1 dark:text-red-400/80">{existingRequest.rejectionReason}</p>}
              <p className="text-xs text-red-500 mt-1 dark:text-red-400/80">Kamu bisa ajukan ulang di bawah ini.</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-6 dark:bg-stone-900 dark:border-stone-800">
          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-center dark:bg-blue-950/20">
            <p className="text-xs text-blue-600 mb-1 dark:text-blue-400">Biaya Upgrade Sekali Bayar</p>
            <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-400">{fee !== null ? formatCurrency(fee) : "..."}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Nama Toko</label>
              <Input required minLength={3} value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Contoh: Batik Sari Ibu" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Nomor HP/WhatsApp</label>
              <Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812xxxxxxx" />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Pilih Metode Pembayaran</label>
              <div className="grid grid-cols-2 gap-2">
                {methods.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setSelectedMethod(m)}
                    className={`p-2.5 rounded-xl border text-sm font-medium transition-all ${
                      selectedMethod?.id === m.id ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400" : "border-gray-200 text-gray-600 hover:border-gray-300 dark:border-stone-700 dark:text-stone-400 dark:hover:border-stone-600"
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            {selectedMethod && (
              <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between dark:bg-stone-800">
                <div>
                  <p className="text-xs text-gray-500 dark:text-stone-400">{selectedMethod.type === "bank" ? "No. Rekening" : "No. HP"}</p>
                  <p className="font-mono font-semibold text-gray-900 dark:text-stone-100">{selectedMethod.accountNumber}</p>
                  <p className="text-xs text-gray-500 mt-1 dark:text-stone-400">a.n. {selectedMethod.accountName}</p>
                </div>
                <button type="button" onClick={() => copyNumber(selectedMethod.accountNumber)} className="p-2 rounded-lg hover:bg-gray-200 transition-colors">
                  <Copy size={16} className="text-gray-500 dark:text-stone-400" />
                </button>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Upload Bukti Transfer</label>
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 rounded-xl py-6 cursor-pointer transition-colors dark:border-blue-900/50 dark:hover:border-blue-700 dark:hover:bg-blue-950/20">
                {previewUrl ? (
                  <img src={previewUrl} alt="preview" className="w-16 h-16 object-cover rounded-lg" />
                ) : (
                  <Upload size={22} className="text-blue-400 dark:text-blue-500" />
                )}
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{file ? file.name : "Klik untuk pilih foto bukti transfer"}</span>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} required />
              </label>
            </div>

            <Button type="submit" variant="premium" size="lg" className="w-full" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" size={18} /> : "Kirim Permintaan"}
            </Button>
            <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1 dark:text-stone-500">
              <Tag size={11} /> Permintaan akan diverifikasi developer dalam 1-2 hari kerja
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
