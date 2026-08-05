"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Package, ArrowRight, Home, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface OrderSummary {
  orderNumber: string;
  grandTotal: string;
}

export function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumbers = (searchParams.get("ids") ?? "").split(",").filter(Boolean);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(orderNumbers.map((num) => fetch(`/api/orders/${num}`).then((r) => r.json())))
      .then((results) => setOrders(results.filter((r) => r.order).map((r) => r.order)))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const total = orders.reduce((sum, o) => sum + Number(o.grandTotal), 0);

  return (
    <section className="py-12 bg-gray-50 min-h-screen dark:bg-stone-900">
      <div className="container mx-auto px-4 max-w-lg">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">Pesanan Berhasil Dibuat!</h1>
          <p className="text-gray-500 mt-1 dark:text-stone-400">
            Karena keranjangmu berisi produk dari beberapa toko berbeda, pesananmu otomatis kepisah jadi {orders.length} pesanan terpisah (masing-masing per toko).
          </p>
        </motion.div>

        {!loading && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 text-center dark:bg-stone-900 dark:border-stone-800">
              <p className="text-xs text-gray-500 dark:text-stone-400">Total Keseluruhan</p>
              <p className="text-2xl font-extrabold text-blue-600">{formatCurrency(total)}</p>
              <p className="text-xs text-gray-400 mt-1 dark:text-stone-500">Cukup transfer/bayar 1 kali untuk total ini</p>
            </div>

            <div className="space-y-3 mb-6">
              {orders.map((order, i) => (
                <motion.div key={order.orderNumber} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/pesanan/${order.orderNumber}`} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all dark:bg-stone-900 dark:border-stone-800">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Store size={18} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono font-semibold text-gray-900 text-sm dark:text-stone-100">{order.orderNumber}</p>
                      <p className="text-xs text-gray-400 dark:text-stone-500">{formatCurrency(Number(order.grandTotal))}</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-300" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-xl p-4 mb-6 flex gap-3">
              <Package size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                Upload bukti transfer di salah satu pesanan di atas — otomatis berlaku untuk semua pesanan lain dalam checkout ini juga.
              </p>
            </div>
          </>
        )}

        <div className="flex gap-3">
          <Link href="/" className="flex-1"><Button variant="outline" className="w-full"><Home size={16} className="mr-2" /> Beranda</Button></Link>
          <Link href="/pesanan" className="flex-1"><Button variant="premium" className="w-full">Lihat Semua Pesanan</Button></Link>
        </div>
      </div>
    </section>
  );
}
