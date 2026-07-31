"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Package, MapPin, CreditCard, Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

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
  trackingNumber: string | null;
  notes: string | null;
  createdAt: string;
}

interface OrderItem {
  id: number;
  productName: string;
  productImage: string | null;
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

const paymentMethodLabel: Record<string, string> = {
  bank_transfer: "Transfer Bank",
  ewallet: "E-Wallet",
  cod: "Bayar di Tempat (COD)",
};

export function OrderDetailPage({ orderNumber }: { orderNumber: string }) {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
            <div className="flex items-center gap-2"><CreditCard size={15} className="text-gray-400 flex-shrink-0" /><span className="text-gray-600">{paymentMethodLabel[order.paymentMethod] ?? order.paymentMethod}</span></div>
          </div>

          {order.trackingNumber && (
            <div className="bg-blue-50 rounded-xl p-3 text-sm">
              <span className="text-gray-500">No. Resi: </span><span className="font-mono font-semibold text-gray-900">{order.trackingNumber}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <Link href="/" className="flex-1"><Button variant="outline" className="w-full"><Home size={16} className="mr-2" /> Beranda</Button></Link>
          <Link href="/produk" className="flex-1"><Button variant="premium" className="w-full">Belanja Lagi</Button></Link>
        </div>
      </div>
    </section>
  );
}
