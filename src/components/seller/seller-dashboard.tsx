"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { DollarSign, ShoppingBag, Package, AlertTriangle, Loader2, Inbox, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface Stats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalProductsSold: number;
  recentOrders: { orderNumber: string; status: string; grandTotal: string; createdAt: string }[];
}

const statusLabel: Record<string, string> = {
  pending: "Menunggu", confirmed: "Dikonfirmasi", processing: "Diproses",
  shipped: "Dikirim", delivered: "Selesai", cancelled: "Dibatalkan", refunded: "Refund",
};
const statusVariant: Record<string, "warning" | "default" | "success" | "destructive" | "secondary"> = {
  pending: "warning", confirmed: "default", processing: "secondary", shipped: "default",
  delivered: "success", cancelled: "destructive", refunded: "secondary",
};

export function SellerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/seller/dashboard-stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center py-24 text-gray-400 dark:text-stone-500"><Loader2 className="animate-spin" size={32} /></div>;
  }
  if (!stats) return <p className="text-center py-24 text-gray-400 text-sm dark:text-stone-500">Gagal memuat data.</p>;

  const statCards = [
    { label: "Total Pendapatan", value: formatCurrency(stats.totalRevenue), icon: DollarSign, bg: "bg-green-50", color: "text-green-600" },
    { label: "Total Pesanan", value: stats.totalOrders.toLocaleString("id-ID"), icon: ShoppingBag, bg: "bg-blue-50", color: "text-blue-600" },
    { label: "Produk Aktif", value: stats.totalProducts.toLocaleString("id-ID"), icon: Package, bg: "bg-purple-50", color: "text-purple-600" },
    { label: "Terjual", value: stats.totalProductsSold.toLocaleString("id-ID"), icon: Package, bg: "bg-emerald-50", color: "text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">Dashboard Toko</h1>
        <p className="text-gray-500 text-sm mt-1 dark:text-stone-400">Ringkasan performa toko kamu</p>
      </motion.div>

      {stats.pendingOrders > 0 && (
        <Link href="/seller/orders" className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl p-4 hover:bg-yellow-100/70 transition-colors dark:bg-yellow-950/20 dark:border-yellow-900/40 dark:hover:bg-yellow-950/30">
          <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 dark:text-yellow-400" />
          <p className="text-sm text-yellow-800 flex-1 dark:text-yellow-400">{stats.pendingOrders} pesanan menunggu diproses</p>
          <ArrowRight size={16} className="text-yellow-600 dark:text-yellow-400" />
        </Link>
      )}
      {stats.lowStockProducts > 0 && (
        <Link href="/seller/products" className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 hover:bg-red-100/70 transition-colors dark:bg-red-950/20 dark:border-red-900/40 dark:hover:bg-red-950/30">
          <AlertTriangle size={20} className="text-red-600 flex-shrink-0 dark:text-red-400" />
          <p className="text-sm text-red-800 flex-1 dark:text-red-400">{stats.lowStockProducts} produk stoknya menipis (≤5)</p>
          <ArrowRight size={16} className="text-red-600 dark:text-red-400" />
        </Link>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-5">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <stat.icon className={stat.color} size={20} />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-stone-100">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1 dark:text-stone-400">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Pesanan Terbaru</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {stats.recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-stone-500"><Inbox size={28} className="mb-2 opacity-40" /><p className="text-sm">Belum ada pesanan masuk.</p></div>
          ) : (
            stats.recentOrders.map((order) => (
              <div key={order.orderNumber} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors dark:hover:bg-stone-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 font-mono dark:text-stone-100">{order.orderNumber}</span>
                    <Badge variant={statusVariant[order.status] ?? "secondary"} className="text-[10px]">{statusLabel[order.status] ?? order.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-stone-500">{new Date(order.createdAt).toLocaleDateString("id-ID")}</p>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-stone-100">{formatCurrency(Number(order.grandTotal))}</span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
