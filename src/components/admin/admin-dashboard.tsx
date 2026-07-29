"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  {
    label: "Total Pendapatan",
    value: "Rp 125.500.000",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "from-green-500 to-emerald-500",
    bg: "bg-green-50",
  },
  {
    label: "Total Pesanan",
    value: "1,234",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingBag,
    color: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50",
  },
  {
    label: "Pelanggan Baru",
    value: "456",
    change: "-3.1%",
    trend: "down",
    icon: Users,
    color: "from-purple-500 to-violet-500",
    bg: "bg-purple-50",
  },
  {
    label: "Produk Terjual",
    value: "3,890",
    change: "+22.4%",
    trend: "up",
    icon: Package,
    color: "from-orange-500 to-red-500",
    bg: "bg-orange-50",
  },
];

const recentOrders = [
  { id: "#ORD-001", customer: "Budi Santoso", product: "Batik Tulis Madura", amount: "Rp 350.000", status: "confirmed" },
  { id: "#ORD-002", customer: "Anita Wijaya", product: "Keripik Singkong", amount: "Rp 75.000", status: "pending" },
  { id: "#ORD-003", customer: "Sari Dewi", product: "Tas Anyaman Rotan", amount: "Rp 185.000", status: "shipped" },
  { id: "#ORD-004", customer: "Rahmat Hidayat", product: "Kopi Arabika Gayo", amount: "Rp 225.000", status: "delivered" },
  { id: "#ORD-005", customer: "Dewi Lestari", product: "Kain Tenun NTT", amount: "Rp 450.000", status: "processing" },
];

const statusColors: Record<string, string> = {
  pending: "warning",
  confirmed: "default",
  processing: "secondary",
  shipped: "default",
  delivered: "success",
  cancelled: "destructive",
};

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Ringkasan bisnis Anda hari ini</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                    <stat.icon className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} size={20} />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                    {stat.trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {stat.change}
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts & Orders */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Grafik Penjualan</span>
                <Badge variant="outline" className="text-xs">30 Hari Terakhir</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-2">
                {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95, 65, 80, 70, 55, 90, 75, 60, 85, 95, 70, 80, 90, 75, 60, 85, 70, 95, 80].map(
                  (h, i) => (
                    <div key={i} className="flex-1 bg-blue-100 hover:bg-blue-200 rounded-t-md transition-all" style={{ height: `${h}%` }} />
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Pesanan Terbaru</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">{order.id}</span>
                      <Badge variant={statusColors[order.status] as any} className="text-[10px]">
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{order.product}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 whitespace-nowrap ml-2">{order.amount}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
