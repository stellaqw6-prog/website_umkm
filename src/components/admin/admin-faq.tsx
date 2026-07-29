"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Edit, Trash2, ChevronDown, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const faqs = [
  { id: 1, category: "Pemesanan", question: "Bagaimana cara melakukan pemesanan produk?", answer: "Pilih produk, klik tombol Beli Sekarang atau tambahkan ke keranjang, lalu ikuti proses checkout hingga pembayaran selesai." },
  { id: 2, category: "Pembayaran", question: "Metode pembayaran apa saja yang tersedia?", answer: "Kami menerima transfer bank, e-wallet (OVO, GoPay, DANA), dan kartu kredit/debit melalui payment gateway." },
  { id: 3, category: "Pengiriman", question: "Berapa lama waktu pengiriman produk?", answer: "Estimasi pengiriman 2-5 hari kerja untuk Jawa dan 5-10 hari kerja untuk luar Jawa, tergantung ekspedisi yang dipilih." },
  { id: 4, category: "Pengembalian", question: "Apakah bisa melakukan retur produk?", answer: "Bisa, selama produk belum digunakan dan pengajuan retur dilakukan maksimal 2x24 jam setelah barang diterima." },
  { id: 5, category: "Akun", question: "Bagaimana cara mereset kata sandi akun saya?", answer: "Klik Lupa Password di halaman login, lalu ikuti instruksi yang dikirimkan ke email terdaftar Anda." },
];

export function AdminFaq() {
  const [openId, setOpenId] = useState<number | null>(faqs[0].id);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FAQ</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola pertanyaan yang sering diajukan</p>
        </div>
        <Button variant="premium">
          <Plus size={18} className="mr-2" /> Tambah FAQ
        </Button>
      </motion.div>

      <Card>
        <CardHeader className="pb-0">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Cari pertanyaan..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="border border-gray-100 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50/50 transition-colors"
              >
                <GripVertical size={15} className="text-gray-300 flex-shrink-0" />
                <Badge variant="secondary" className="text-[10px] flex-shrink-0">{faq.category}</Badge>
                <span className="flex-1 text-sm font-medium text-gray-900">{faq.question}</span>
                <ChevronDown
                  size={16}
                  className={cn("text-gray-400 transition-transform flex-shrink-0", openId === faq.id && "rotate-180")}
                />
              </button>
              {openId === faq.id && (
                <div className="px-4 pb-4 pl-11">
                  <p className="text-sm text-gray-500 leading-relaxed mb-3">{faq.answer}</p>
                  <div className="flex items-center gap-1">
                    <button className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-blue-600 py-1.5 px-3 rounded-lg hover:bg-gray-50 transition-all">
                      <Edit size={13} /> Edit
                    </button>
                    <button className="flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-red-600 py-1.5 px-3 rounded-lg hover:bg-gray-50 transition-all">
                      <Trash2 size={13} /> Hapus
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
