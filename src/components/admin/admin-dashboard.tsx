"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Inbox,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProductsSold: number;
  revenueChangePercent: number | null;
  recentOrders: { orderNumber: string; customer: string; product: string; amount: number; status: string }[];
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
}

const statusLabel: Record<string, string> = {
  pending: "Menunggu", confirmed: "Dikonfirmasi", processing: "Diproses",
  shipped: "Dikirim", delivered: "Selesai", cancelled: "Dibatalkan", refunded: "Refund",
};
const statusVariant: Record<string, "warning" | "default" | "success" | "destructive" | "secondary"> = {
  pending: "warning", confirmed: "default", processing: "secondary", shipped: "default",
  delivered: "success", cancelled: "destructive", refunded: "secondary",
};

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard-stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-gray-400 dark:text-stone-500">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-center py-24 text-gray-400 text-sm dark:text-stone-500">Gagal memuat statistik dashboard.</p>;
  }

  const maxRevenue = Math.max(...stats.monthlyRevenue.map((m) => m.revenue), 1);

  const statCards = [
    {
      label: "Total Pendapatan",
      value: formatCurrency(stats.totalRevenue),
      change: stats.revenueChangePercent,
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      bg: "bg-green-50",
    },
    {
      label: "Total Pesanan",
      value: stats.totalOrders.toLocaleString("id-ID"),
      change: null,
      icon: ShoppingBag,
      color: "from-blue-500 to-indigo-500",
      bg: "bg-blue-50",
    },
    {
      label: "Total Pelanggan",
      value: stats.totalCustomers.toLocaleString("id-ID"),
      change: null,
      icon: Users,
      color: "from-purple-500 to-violet-500",
      bg: "bg-purple-50",
    },
    {
      label: "Produk Terjual",
      value: stats.totalProductsSold.toLocaleString("id-ID"),
      change: null,
      icon: Package,
      color: "from-orange-500 to-red-500",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1 dark:text-stone-400">Ringkasan bisnis Anda berdasarkan data pesanan asli</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} size={20} />
                  </div>
                  {stat.change !== null && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${stat.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {stat.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {stat.change >= 0 ? "+" : ""}{stat.change}%
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-stone-100">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1 dark:text-stone-400">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Grafik Penjualan</span>
                <Badge variant="outline" className="text-xs">6 Bulan Terakhir</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.totalOrders === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center text-gray-400 dark:text-stone-500">
                  <TrendingUp size={32} className="mb-2 opacity-40" />
                  <p className="text-sm">Belum ada data penjualan.</p>
                  <p className="text-xs">Grafik akan terisi begitu ada pesanan masuk.</p>
                </div>
              ) : (
                <div className="h-64 flex items-end gap-3">
                  {stats.monthlyRevenue.map((m) => (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex items-end justify-center" style={{ height: "220px" }}>
                        <div
                          className="w-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 rounded-t-md transition-all relative group"
                          style={{ height: `${Math.max((m.revenue / maxRevenue) * 100, m.revenue > 0 ? 4 : 1)}%` }}
                        >
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap dark:text-stone-400">
                            {formatCurrency(m.revenue)}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 dark:text-stone-500">{m.month}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Pesanan Terbaru</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.recentOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400 dark:text-stone-500">
                  <Inbox size={28} className="mb-2 opacity-40" />
                  <p className="text-sm">Belum ada pesanan masuk.</p>
                </div>
              ) : (
                stats.recentOrders.map((order) => (
                  <div key={order.orderNumber} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors dark:hover:bg-stone-800">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 font-mono dark:text-stone-100">{order.orderNumber}</span>
                        <Badge variant={statusVariant[order.status] ?? "secondary"} className="text-[10px]">
                          {statusLabel[order.status] ?? order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 truncate dark:text-stone-400">{order.customer} · {order.product}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 whitespace-nowrap ml-2 dark:text-stone-100">{formatCurrency(order.amount)}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
