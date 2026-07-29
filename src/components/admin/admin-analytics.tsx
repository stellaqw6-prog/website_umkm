"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Download,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const revenueData = [
  { month: "Feb", revenue: 42000000, orders: 210 },
  { month: "Mar", revenue: 55000000, orders: 265 },
  { month: "Apr", revenue: 48000000, orders: 240 },
  { month: "Mei", revenue: 61000000, orders: 300 },
  { month: "Jun", revenue: 72000000, orders: 350 },
  { month: "Jul", revenue: 68000000, orders: 330 },
  { month: "Agu", revenue: 84000000, orders: 410 },
  { month: "Sep", revenue: 79000000, orders: 390 },
  { month: "Okt", revenue: 91000000, orders: 445 },
  { month: "Nov", revenue: 103000000, orders: 500 },
  { month: "Des", revenue: 118000000, orders: 560 },
  { month: "Jan", revenue: 125500000, orders: 610 },
];

const categoryData = [
  { name: "Fashion", value: 35, color: "#2563eb" },
  { name: "Makanan", value: 28, color: "#f97316" },
  { name: "Kerajinan", value: 18, color: "#8b5cf6" },
  { name: "Minuman", value: 12, color: "#10b981" },
  { name: "Lainnya", value: 7, color: "#6b7280" },
];

const topProducts = [
  { name: "Batik Tulis Madura Premium", sold: 412, revenue: 144200000 },
  { name: "Kopi Arabika Gayo 250gr", sold: 389, revenue: 29175000 },
  { name: "Keripik Singkong Balado", sold: 356, revenue: 8900000 },
  { name: "Kain Tenun NTT Premium", sold: 198, revenue: 89100000 },
  { name: "Madu Hutan Sumatera 500ml", sold: 176, revenue: 21120000 },
];

const summary = [
  {
    label: "Pendapatan (30 hari)",
    value: "Rp 125.500.000",
    change: "+12.5%",
    icon: DollarSign,
    bg: "bg-green-50",
    color: "text-green-600",
  },
  {
    label: "Pesanan (30 hari)",
    value: "610",
    change: "+8.9%",
    icon: ShoppingBag,
    bg: "bg-blue-50",
    color: "text-blue-600",
  },
  {
    label: "Pelanggan Aktif",
    value: "2,340",
    change: "+4.2%",
    icon: Users,
    bg: "bg-purple-50",
    color: "text-purple-600",
  },
  {
    label: "Rata-rata Order",
    value: "Rp 205.700",
    change: "+3.1%",
    icon: TrendingUp,
    bg: "bg-orange-50",
    color: "text-orange-600",
  },
];

export function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analitik</h1>
          <p className="text-gray-500 text-sm mt-1">Performa bisnis Anda dalam 12 bulan terakhir</p>
        </div>
        <Button variant="outline">
          <Download size={16} className="mr-2" /> Export Laporan
        </Button>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center`}>
                    <item.icon className={item.color} size={20} />
                  </div>
                  <span className="text-xs font-medium text-green-600">{item.change}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{item.value}</div>
                <p className="text-xs text-gray-500 mt-1">{item.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tren Pendapatan</CardTitle>
              <CardDescription>Pendapatan bulanan (Rp)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v / 1000000}jt`}
                    />
                   <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#revColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader>
              <CardTitle>Penjualan per Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-gray-600">{cat.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Orders bar chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Jumlah Pesanan per Bulan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top products */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardHeader>
              <CardTitle>Produk Terlaris</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="secondary" className="w-6 h-6 rounded-full flex items-center justify-center p-0 flex-shrink-0">
                      {i + 1}
                    </Badge>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.sold} terjual</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 whitespace-nowrap">
                    {formatCurrency(p.revenue)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
