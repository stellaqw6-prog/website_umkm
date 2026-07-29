"use client";

import { motion } from "framer-motion";
import { Search, Filter, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const orders = [
  { id: "#ORD-001", customer: "Budi Santoso", date: "15 Jan 2026", total: "Rp 350.000", payment: "paid", status: "shipped" },
  { id: "#ORD-002", customer: "Anita Wijaya", date: "15 Jan 2026", total: "Rp 75.000", payment: "unpaid", status: "pending" },
  { id: "#ORD-003", customer: "Sari Dewi", date: "14 Jan 2026", total: "Rp 185.000", payment: "paid", status: "delivered" },
  { id: "#ORD-004", customer: "Rahmat Hidayat", date: "14 Jan 2026", total: "Rp 225.000", payment: "paid", status: "processing" },
  { id: "#ORD-005", customer: "Dewi Lestari", date: "13 Jan 2026", total: "Rp 450.000", payment: "expired", status: "cancelled" },
];

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  pending: "warning",
  confirmed: "default",
  processing: "secondary",
  shipped: "default",
  delivered: "success",
  cancelled: "destructive",
};

const paymentVariant: Record<string, "default" | "success" | "warning" | "destructive"> = {
  paid: "success",
  unpaid: "warning",
  expired: "destructive",
  refunded: "destructive",
};

export function AdminOrders() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900">Pesanan</h1>
        <p className="text-gray-500 text-sm mt-1">Kelola semua pesanan pelanggan</p>
      </motion.div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Cari pesanan..." className="pl-9" />
            </div>
            <Button variant="outline"><Filter size={16} className="mr-2" /> Filter</Button>
            <Button variant="outline"><Download size={16} className="mr-2" /> Export</Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Order ID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Pelanggan</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Total</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Pembayaran</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-sm text-gray-900">{order.id}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{order.customer}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">{order.date}</td>
                    <td className="py-3 px-4 text-sm font-semibold text-right">{order.total}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={paymentVariant[order.payment]} className="text-[10px]">{order.payment}</Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={statusVariant[order.status]} className="text-[10px]">{order.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-all">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
