"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Users as UsersIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  membership: string;
  isActive: boolean;
  orders: number;
  totalSpent: number;
  joined: string;
}

const membershipVariant: Record<string, "secondary" | "default" | "warning" | "premium"> = {
  regular: "secondary", silver: "default", gold: "warning", platinum: "premium",
};

export function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(data.customers ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pelanggan</h1>
        <p className="text-gray-500 text-sm mt-1 dark:text-gray-400">Data pelanggan yang sudah mendaftar dan riwayat belanjanya</p>
      </motion.div>

      <Card>
        <CardHeader className="pb-0">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <Input placeholder="Cari nama atau email pelanggan..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex justify-center py-16 text-gray-400 dark:text-gray-500"><Loader2 className="animate-spin" size={28} /></div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
              <UsersIcon size={32} className="mb-2 opacity-40" />
              <p className="text-sm">Belum ada pelanggan yang mendaftar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">Pelanggan</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">Kontak</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">Membership</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">Pesanan</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">Total Belanja</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase dark:text-gray-400">Bergabung</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((customer) => (
                    <tr key={customer.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {customer.name.charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900 text-sm dark:text-gray-100">{customer.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs text-gray-500 dark:text-gray-400">{customer.email}</div>
                        {customer.phone && <div className="text-xs text-gray-500 dark:text-gray-400">{customer.phone}</div>}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={membershipVariant[customer.membership]} className="text-[10px] capitalize">{customer.membership}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium text-gray-900 dark:text-gray-100">{customer.orders}</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(customer.totalSpent)}</td>
                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">{new Date(customer.joined).toLocaleDateString("id-ID")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
