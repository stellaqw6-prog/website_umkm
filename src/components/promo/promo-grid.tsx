"use client";

import { motion } from "framer-motion";
import { Tag, Copy, Calendar, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

interface Promo {
  id: number;
  code: string;
  type: string;
  value: string;
  minPurchase: string | null;
  endDate: string | Date;
  description: string | null;
}

const typeLabel: Record<string, string> = { percentage: "Diskon Persentase", fixed: "Potongan Nominal", free_shipping: "Gratis Ongkir" };

function formatValue(promo: Promo) {
  if (promo.type === "percentage") return `${promo.value}%`;
  if (promo.type === "fixed") return `Rp${Number(promo.value).toLocaleString("id-ID")}`;
  return "Gratis Ongkir";
}

export function PromoGrid({ promotions }: { promotions: Promo[] }) {
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Kode "${code}" disalin! Pakai saat checkout.`);
  };

  if (promotions.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-gray-50 rounded-2xl p-10 text-center dark:bg-stone-900">
        <p className="text-6xl mb-4">🏷️</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2 dark:text-stone-100">Belum Ada Promo Aktif</h2>
        <p className="text-gray-500 dark:text-stone-400">Promo spesial sedang kami siapkan. Pantau terus halaman ini!</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {promotions.map((promo, i) => (
        <motion.button
          key={promo.id}
          onClick={() => copyCode(promo.code)}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className="text-left bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-2xl p-6 hover:shadow-lg transition-all relative overflow-hidden group dark:from-red-950/20 dark:to-orange-950/10 dark:border-red-900/40"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-100/50 rounded-full -translate-y-8 translate-x-8 dark:bg-red-900/20" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
                <Ticket size={18} className="text-white" />
              </div>
              <Badge variant="destructive" className="text-[10px]">{typeLabel[promo.type] ?? promo.type}</Badge>
            </div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-1 dark:text-stone-100">{formatValue(promo)}</h3>
            {promo.description && <p className="text-sm text-gray-600 mb-3 dark:text-stone-400">{promo.description}</p>}
            {promo.minPurchase && (
              <p className="text-xs text-gray-500 mb-3 dark:text-stone-400">Min. belanja Rp{Number(promo.minPurchase).toLocaleString("id-ID")}</p>
            )}
            <div className="flex items-center justify-between pt-3 border-t border-red-100 dark:border-red-900/40">
              <span className="font-mono font-bold text-gray-900 flex items-center gap-1.5 dark:text-stone-100">
                <Tag size={13} /> {promo.code}
              </span>
              <span className="flex items-center gap-1 text-xs text-blue-600 font-medium group-hover:underline">
                <Copy size={12} /> Salin
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1 dark:text-stone-500">
              <Calendar size={11} /> Berlaku hingga {new Date(promo.endDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
