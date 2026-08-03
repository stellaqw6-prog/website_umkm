"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Package, MapPin, CreditCard, Loader2, Home, Copy, QrCode, Upload, ImageIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface PaymentMethod {
  id: number;
  name: string;
  type: "ewallet" | "bank" | "cod";
  accountNumber: string;
  accountName: string;
  qrImage: string | null;
  instructions: string | null;
}

interface OrderData {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  shippingCost: string;
  discountAmount: string;
  grandTotal: string;
  shippingAddress: string;
  paymentMethod: string;
  paymentProofUrl: string | null;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: string;
}

interface OrderItem {
  id: number;
  productName: string;
  productImage: string | null;
  variantName: string | null;
  price: string;
  quantity: number;
  subtotal: string;
}

const statusLabel: Record<string, string> = {
  pending: "Menunggu Konfirmasi",
  confirmed: "Dikonfirmasi",
  processing: "Diproses",
  shipped: "Dikirim",
  delivered: "Selesai",
  cancelled: "Dibatalkan",
  refunded: "Dana Dikembalikan",
};

const statusVariant: Record<string, "warning" | "default" | "success" | "destructive" | "secondary"> = {
  pending: "warning",
  confirmed: "default",
  processing: "default",
  shipped: "default",
  delivered: "success",
  cancelled: "destructive",
  refunded: "secondary",
};

export function OrderDetailPage({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/orders/${orderNumber}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
          setItems(data.items ?? []);
        } else {
          setNotFound(true);
          toast.error(data.error ?? "Pesanan tidak ditemukan");
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [orderNumber]);

  useEffect(() => {
    if (!order?.paymentMethod) return;
    fetch("/api/payment-methods")
      .then((res) => res.json())
      .then((data) => {
        const methods: PaymentMethod[] = data.paymentMethods ?? [];
        const match = methods.find((m) => m.name === order.paymentMethod);
        if (match) setPaymentMethod(match);
      })
      .catch(() => {});
  }, [order?.paymentMethod]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Nomor disalin");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 5MB");
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    uploadProof(file);
  };

  const uploadProof = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/orders/${orderNumber}/payment-proof`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Gagal mengunggah bukti transfer");
        setPreviewUrl(null);
        return;
      }

      setOrder(data.order);
      toast.success("Bukti transfer berhasil diunggah! Menunggu verifikasi admin.");
    } catch {
      toast.error("Tidak bisa terhubung ke server");
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-300" size={32} />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Pesanan tidak ditemukan</h2>
          <Link href="/"><Button variant="premium">Kembali ke Beranda</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <section className="py-10 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Pesanan Berhasil Dibuat!</h1>
          <p className="text-gray-500 mt-1">Nomor pesanan: <span className="font-mono font-semibold text-gray-900">{order.orderNumber}</span></p>
        </motion.div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Status Pesanan</span>
            <Badge variant={statusVariant[order.status] ?? "secondary"}>{statusLabel[order.status] ?? order.status}</Badge>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5"><Package size={15} /> Produk</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm">
                  <img src={item.productImage ?? ""} alt={item.productName} className="w-12 h-14 object-cover rounded-lg bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 line-clamp-1">{item.productName}</p>
                    {item.variantName && <p className="text-gray-400 text-xs">Varian: {item.variantName}</p>}
                    <p className="text-gray-500 text-xs">{item.quantity} x {formatCurrency(Number(item.price))}</p>
                  </div>
                  <span className="font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(Number(item.subtotal))}</span>
                </div>
              ))}
            </div>
          </div>

          <hr />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatCurrency(Number(order.totalAmount))}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Ongkir</span><span>{Number(order.shippingCost) === 0 ? "GRATIS" : formatCurrency(Number(order.shippingCost))}</span></div>
            {Number(order.discountAmount) > 0 && <div className="flex justify-between text-green-600"><span>Diskon</span><span>-{formatCurrency(Number(order.discountAmount))}</span></div>}
            <hr />
            <div className="flex justify-between text-base"><span className="font-bold">Total</span><span className="font-bold text-blue-600">{formatCurrency(Number(order.grandTotal))}</span></div>
          </div>

          <hr />

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2"><MapPin size={15} className="text-gray-400 mt-0.5 flex-shrink-0" /><span className="text-gray-600">{order.shippingAddress}</span></div>
            <div className="flex items-center gap-2"><CreditCard size={15} className="text-gray-400 flex-shrink-0" /><span className="text-gray-600">{order.paymentMethod}</span></div>
          </div>

          {order.trackingNumber && (
            <div className="bg-blue-50 rounded-xl p-3 text-sm">
              <span className="text-gray-500">No. Resi: </span><span className="font-mono font-semibold text-gray-900">{order.trackingNumber}</span>
            </div>
          )}
        </div>

        {/* Instruksi pembayaran, tampil selama status belum "paid" (kecuali COD) */}
        {order.paymentStatus === "unpaid" && paymentMethod && paymentMethod.type !== "cod" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-blue-100 p-6 mt-4">
            <h3 className="text-sm font-bold text-gray-900 mb-1">Selesaikan Pembayaran</h3>
            <p className="text-xs text-gray-500 mb-4">
              Bayar sejumlah <span className="font-semibold text-gray-900">{formatCurrency(Number(order.grandTotal))}</span> via {paymentMethod.name} sebelum pesanan diproses.
            </p>

            <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-gray-500">
                    {paymentMethod.type === "bank" ? "Nomor Rekening" : "Nomor HP"}
                  </p>
                  <p className="font-mono font-bold text-gray-900 text-lg">{paymentMethod.accountNumber}</p>
                  <p className="text-xs text-gray-500 mt-0.5">a.n. {paymentMethod.accountName}</p>
                </div>
                <button
                  onClick={() => handleCopy(paymentMethod.accountNumber)}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-blue-200 flex-shrink-0"
                >
                  <Copy size={13} /> Salin
                </button>
              </div>

              {paymentMethod.qrImage && (
                <div className="mt-3 flex items-center gap-3">
                  <img src={paymentMethod.qrImage} alt={`QR ${paymentMethod.name}`} className="w-24 h-24 rounded-lg border border-gray-200 object-contain bg-white" />
                  <p className="text-xs text-gray-500 flex items-center gap-1"><QrCode size={13} /> Atau scan QR code di samping</p>
                </div>
              )}

              {paymentMethod.instructions && (
                <p className="text-xs text-gray-500 mt-3 leading-relaxed">{paymentMethod.instructions}</p>
              )}
            </div>

            {/* Upload bukti transfer */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              {order.paymentProofUrl ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="warning" className="flex items-center gap-1"><Clock size={11} /> Menunggu Verifikasi Admin</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <img src={order.paymentProofUrl} alt="Bukti transfer" className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 mb-2">Bukti transfer sudah diunggah. Admin akan segera memverifikasi pembayaranmu.</p>
                      <label className="text-xs font-medium text-blue-600 hover:underline cursor-pointer">
                        Ganti Bukti Transfer
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} disabled={uploading} />
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1.5"><Upload size={14} /> Upload Bukti Transfer</h4>
                  <p className="text-xs text-gray-500 mb-3">Setelah transfer, upload screenshot/foto bukti pembayaran di sini supaya pesananmu segera diproses.</p>
                  <label
                    className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl py-8 cursor-pointer transition-colors ${
                      uploading ? "border-gray-200 bg-gray-50" : "border-blue-200 hover:border-blue-400 hover:bg-blue-50/50"
                    }`}
                  >
                    {uploading ? (
                      <>
                        {previewUrl && <img src={previewUrl} alt="preview" className="w-16 h-16 object-cover rounded-lg mb-1" />}
                        <Loader2 className="animate-spin text-blue-600" size={22} />
                        <span className="text-xs text-gray-500">Mengunggah...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon size={24} className="text-blue-400" />
                        <span className="text-xs font-medium text-blue-600">Klik untuk pilih foto bukti transfer</span>
                        <span className="text-[11px] text-gray-400">JPG, PNG, atau WEBP — maks 5MB</span>
                      </>
                    )}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelect} disabled={uploading} />
                  </label>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div className="flex gap-3 mt-6">
          <Link href="/" className="flex-1"><Button variant="outline" className="w-full"><Home size={16} className="mr-2" /> Beranda</Button></Link>
          <Link href="/produk" className="flex-1"><Button variant="premium" className="w-full">Belanja Lagi</Button></Link>
        </div>
      </div>
    </section>
  );
}
