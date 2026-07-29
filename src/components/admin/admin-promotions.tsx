"use client";

import { motion } from "framer-motion";
import { Plus, Search, Copy, Edit, Trash2, Tag, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import toast from "react-hot-toast";

const promotions = [
  { id: 1, code: "GAJIAN25", type: "Persentase", value: "25%", minPurchase: "Rp 150.000", used: 342, limit: 500, start: "01 Jan 2026", end: "31 Jan 2026", status: "active" },
  { id: 2, code: "ONGKIRGRATIS", type: "Ongkir", value: "Gratis Ongkir", minPurchase: "Rp 100.000", used: 890, limit: 1000, start: "01 Jan 2026", end: "15 Feb 2026", status: "active" },
  { id: 3, code: "NEWUSER50K", type: "Nominal", value: "Rp 50.000", minPurchase: "Rp 200.000", used: 156, limit: 200, start: "15 Des 2025", end: "31 Jan 2026", status: "active" },
  { id: 4, code: "IMLEK2026", type: "Persentase", value: "20%", minPurchase: "Rp 100.000", used: 500, limit: 500, start: "01 Feb 2026", end: "17 Feb 2026", status: "scheduled" },
  { id: 5, code: "AKHIRTAHUN24", type: "Persentase", value: "30%", minPurchase: "Rp 250.000", used: 1200, limit: 1200, start: "20 Des 2025", end: "31 Des 2025", status: "expired" },
];

const statusVariant: Record<string, "success" | "warning" | "secondary"> = {
  active: "success",
  scheduled: "warning",
  expired: "secondary",
};

const statusLabel: Record<string, string> = {
  active: "Aktif",
  scheduled: "Terjadwal",
  expired: "Berakhir",
};

export function AdminPromotions() {
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Kode "${code}" disalin`);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promo</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola kode voucher dan diskon</p>
        </div>
        <Button variant="premium">
          <Plus size={18} className="mr-2" /> Buat Promo
        </Button>
      </motion.div>

      <Card>
        <CardHeader className="pb-0">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Cari kode promo..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {promotions.map((promo, i) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Tag size={18} className="text-white" />
                    </div>
                    <div>
                      <button
                        onClick={() => copyCode(promo.code)}
                        className="flex items-center gap-1.5 font-mono font-bold text-gray-900 text-sm hover:text-blue-600 transition-colors"
                      >
                        {promo.code} <Copy size={12} />
                      </button>
                      <p className="text-xs text-gray-500">{promo.type} · {promo.value}</p>
                    </div>
                  </div>
                  <Badge variant={statusVariant[promo.status]} className="text-[10px] flex-shrink-0">
                    {statusLabel[promo.status]}
                  </Badge>
                </div>

                <p className="text-xs text-gray-500 mb-2">Min. pembelian {promo.minPurchase}</p>

                <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                  <Calendar size={12} /> {promo.start} – {promo.end}
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Terpakai</span>
                    <span>{promo.used}/{promo.limit}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.min((promo.used / promo.limit) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1 pt-2 border-t border-gray-50">
                  <button className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-gray-600 hover:text-blue-600 py-1.5 rounded-lg hover:bg-gray-50 transition-all">
                    <Edit size={13} /> Edit
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 text-xs font-medium text-gray-600 hover:text-red-600 py-1.5 rounded-lg hover:bg-gray-50 transition-all">
                    <Trash2 size={13} /> Hapus
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
