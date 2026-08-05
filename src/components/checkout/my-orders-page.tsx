"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Loader2, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";

interface OrderRow {
  id: number;
  orderNumber: string;
  status: string;
  grandTotal: string;
  createdAt: string;
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

export function MyOrdersPage() {
  const { user, loading: sessionLoading } = useSession();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders ?? []))
      .finally(() => setLoading(false));
  }, [user, sessionLoading]);

  if (sessionLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-300" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 dark:text-stone-100">Login Diperlukan</h2>
          <p className="text-gray-500 mb-6 dark:text-stone-400">Silakan login untuk melihat riwayat pesanan Anda.</p>
          <Link href="/login?redirect=/pesanan"><Button variant="premium">Login Sekarang</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <section className="py-10 bg-gray-50 min-h-screen dark:bg-stone-900">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-gray-900 mb-8 dark:text-stone-100">
          Pesanan Saya
        </motion.h1>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 dark:bg-stone-900 dark:border-stone-800">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-900 mb-1 dark:text-stone-100">Belum ada pesanan</h3>
            <p className="text-gray-500 text-sm mb-6 dark:text-stone-400">Yuk mulai belanja produk UMKM favoritmu!</p>
            <Link href="/produk"><Button variant="premium">Jelajahi Produk</Button></Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, i) => (
              <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link
                  href={`/pesanan/${order.orderNumber}`}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all dark:bg-stone-900 dark:border-stone-800"
                >
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Package size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-semibold text-gray-900 text-sm dark:text-stone-100">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 dark:text-stone-500">{new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900 text-sm dark:text-stone-100">{formatCurrency(Number(order.grandTotal))}</p>
                    <Badge variant={statusVariant[order.status] ?? "secondary"} className="text-[10px] mt-1">{statusLabel[order.status] ?? order.status}</Badge>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
