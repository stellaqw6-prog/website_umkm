"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, DollarSign, ShoppingBag, Users, Loader2, Inbox } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProductsSold: number;
  revenueChangePercent: number | null;
  monthlyRevenue: { month: string; revenue: number; orders: number }[];
  topProducts: { name: string; sold: number; revenue: number }[];
  categoryDistribution: { name: string; value: number }[];
}

const CHART_COLORS = ["#2563eb", "#f97316", "#8b5cf6", "#10b981", "#eab308", "#6b7280"];

export function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard-stats")
      .then((res) => res.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-gray-400 dark:text-stone-500">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (!data) {
    return <p className="text-center py-24 text-gray-400 text-sm dark:text-stone-500">Gagal memuat data analitik.</p>;
  }

  const avgOrderValue = data.totalOrders > 0 ? data.totalRevenue / data.totalOrders : 0;

  const summary = [
    { label: "Pendapatan (6 bulan)", value: formatCurrency(data.totalRevenue), change: data.revenueChangePercent, icon: DollarSign, bg: "bg-green-50", color: "text-green-600" },
    { label: "Total Pesanan", value: data.totalOrders.toLocaleString("id-ID"), change: null, icon: ShoppingBag, bg: "bg-blue-50", color: "text-blue-600" },
    { label: "Total Pelanggan", value: data.totalCustomers.toLocaleString("id-ID"), change: null, icon: Users, bg: "bg-purple-50", color: "text-purple-600" },
    { label: "Rata-rata Order", value: formatCurrency(avgOrderValue), change: null, icon: TrendingUp, bg: "bg-orange-50", color: "text-orange-600" },
  ];

  const categoryData = data.categoryDistribution.map((c, i) => ({ ...c, color: CHART_COLORS[i % CHART_COLORS.length] }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">Analitik</h1>
        <p className="text-gray-500 text-sm mt-1 dark:text-stone-400">Performa bisnis Anda berdasarkan data pesanan asli, 6 bulan terakhir</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary.map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 ${item.bg} rounded-xl flex items-center justify-center`}>
                    <item.icon className={item.color} size={20} />
                  </div>
                  {item.change !== null && (
                    <span className={`text-xs font-medium ${item.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {item.change >= 0 ? "+" : ""}{item.change}%
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-stone-100">{item.value}</div>
                <p className="text-xs text-gray-500 mt-1 dark:text-stone-400">{item.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {data.totalOrders === 0 ? (
        <Card>
          <CardContent className="py-20 flex flex-col items-center justify-center text-center text-gray-400 dark:text-stone-500">
            <Inbox size={40} className="mb-3 opacity-40" />
            <h3 className="font-semibold text-gray-600 mb-1 dark:text-stone-400">Belum Ada Data Penjualan</h3>
            <p className="text-sm">Grafik dan analitik akan otomatis terisi begitu pelanggan mulai memesan produk.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tren Pendapatan</CardTitle>
                  <CardDescription>Pendapatan bulanan (Rp)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000000}jt`} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} fill="url(#revColor)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Penjualan per Kategori</CardTitle>
                </CardHeader>
                <CardContent>
                  {categoryData.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-10 dark:text-stone-500">Belum ada data kategori.</p>
                  ) : (
                    <>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={2}>
                              {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="space-y-2 mt-2">
                        {categoryData.map((cat) => (
                          <div key={cat.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                              <span className="text-gray-600 dark:text-stone-400">{cat.name}</span>
                            </div>
                            <span className="font-medium text-gray-900 dark:text-stone-100">{cat.value}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Jumlah Pesanan per Bulan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="orders" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Produk Terlaris</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.topProducts.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6 dark:text-stone-500">Belum ada produk terjual.</p>
                  ) : (
                    data.topProducts.map((p, i) => (
                      <div key={p.name} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <Badge variant="secondary" className="w-6 h-6 rounded-full flex items-center justify-center p-0 flex-shrink-0">{i + 1}</Badge>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate dark:text-stone-100">{p.name}</p>
                            <p className="text-xs text-gray-500 dark:text-stone-400">{p.sold} terjual</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 whitespace-nowrap dark:text-stone-100">{formatCurrency(p.revenue)}</span>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
