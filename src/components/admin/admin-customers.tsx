"use client";

import { motion } from "framer-motion";
import { Search, Filter, Download, Mail, Phone, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

const customers = [
  { id: 1, name: "Budi Santoso", email: "budi.santoso@gmail.com", phone: "0812-3456-7890", membership: "gold", orders: 24, totalSpent: 8250000, joined: "12 Mar 2024" },
  { id: 2, name: "Anita Wijaya", email: "anita.wijaya@gmail.com", phone: "0813-2233-4455", membership: "regular", orders: 3, totalSpent: 425000, joined: "02 Jan 2026" },
  { id: 3, name: "Sari Dewi", email: "sari.dewi@yahoo.com", phone: "0857-1122-3344", membership: "platinum", orders: 56, totalSpent: 21500000, joined: "20 Jul 2023" },
  { id: 4, name: "Rahmat Hidayat", email: "rahmat.h@gmail.com", phone: "0821-9988-7766", membership: "silver", orders: 11, totalSpent: 2100000, joined: "15 Sep 2025" },
  { id: 5, name: "Dewi Lestari", email: "dewi.lestari@outlook.com", phone: "0878-5544-3322", membership: "regular", orders: 1, totalSpent: 450000, joined: "13 Jan 2026" },
  { id: 6, name: "Agus Setiawan", email: "agus.setiawan@gmail.com", phone: "0812-1122-9900", membership: "silver", orders: 8, totalSpent: 1620000, joined: "04 Nov 2025" },
];

const membershipVariant: Record<string, "secondary" | "default" | "warning" | "premium"> = {
  regular: "secondary",
  silver: "default",
  gold: "warning",
  platinum: "premium",
};

export function AdminCustomers() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pelanggan</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola data dan riwayat pelanggan Anda</p>
        </div>
        <Button variant="outline">
          <Download size={16} className="mr-2" /> Export Data
        </Button>
      </motion.div>

      <Card>
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Cari nama atau email pelanggan..." className="pl-9" />
            </div>
            <Button variant="outline"><Filter size={16} className="mr-2" /> Filter Membership</Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Pelanggan</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Kontak</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Membership</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Pesanan</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Total Belanja</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Bergabung</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {customer.name.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-900 text-sm">{customer.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-gray-500 flex items-center gap-1 mb-0.5">
                        <Mail size={12} /> {customer.email}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone size={12} /> {customer.phone}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={membershipVariant[customer.membership]} className="text-[10px] capitalize">
                        {customer.membership}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-right font-medium text-gray-900">{customer.orders}</td>
                    <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">{customer.joined}</td>
                    <td className="py-3 px-4 text-right">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-all">
                        <MoreHorizontal size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Menampilkan 1-6 dari 2,340 pelanggan</p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>Sebelumnya</Button>
              <Button variant="default" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">Selanjutnya</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
