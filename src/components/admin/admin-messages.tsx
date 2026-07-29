"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Mail, MailOpen, Trash2, Reply, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const messages = [
  { id: 1, name: "Fitri Ramadhani", email: "fitri.r@gmail.com", subject: "Tanya ketersediaan stok batik ukuran L", message: "Halo, saya mau tanya apakah Batik Tulis Madura Premium ukuran L masih tersedia? Terima kasih.", date: "2 jam lalu", read: false },
  { id: 2, name: "Hendra Gunawan", email: "hendra.g@yahoo.com", subject: "Kerjasama reseller", message: "Selamat siang, saya tertarik menjadi reseller untuk produk kopi dan keripik. Bagaimana caranya ya?", date: "5 jam lalu", read: false },
  { id: 3, name: "Lina Marlina", email: "lina.m@gmail.com", subject: "Komplain pesanan belum sampai", message: "Pesanan saya #ORD-231 sudah 10 hari belum sampai, mohon dicek statusnya.", date: "1 hari lalu", read: true },
  { id: 4, name: "Yusuf Ibrahim", email: "yusuf.ibrahim@outlook.com", subject: "Request custom motif tenun", message: "Apakah bisa pesan kain tenun dengan motif custom sesuai request? Untuk acara pernikahan.", date: "2 hari lalu", read: true },
];

export function AdminMessages() {
  const [selected, setSelected] = useState(messages[0]);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900">Pesan</h1>
        <p className="text-gray-500 text-sm mt-1">Pesan masuk dari formulir kontak pelanggan</p>
      </motion.div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* List */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input placeholder="Cari pesan..." className="pl-9 h-9" />
            </div>
          </div>
          <div className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelected(msg)}
                className={cn(
                  "w-full text-left p-4 hover:bg-gray-50/50 transition-colors",
                  selected.id === msg.id && "bg-blue-50/50"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("text-sm", !msg.read ? "font-bold text-gray-900" : "font-medium text-gray-700")}>
                    {msg.name}
                  </span>
                  {!msg.read && <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />}
                </div>
                <p className={cn("text-xs mb-1 truncate", !msg.read ? "font-semibold text-gray-800" : "text-gray-500")}>
                  {msg.subject}
                </p>
                <p className="text-xs text-gray-400 truncate">{msg.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">{msg.date}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Detail */}
        <Card className="lg:col-span-3">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selected.subject}</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Dari <span className="font-medium text-gray-700">{selected.name}</span> ({selected.email})
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{selected.date}</p>
              </div>
              <Badge variant={selected.read ? "secondary" : "default"} className="text-[10px] flex items-center gap-1 flex-shrink-0">
                {selected.read ? <MailOpen size={11} /> : <Mail size={11} />}
                {selected.read ? "Dibaca" : "Baru"}
              </Badge>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed mb-5">
              {selected.message}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                <Reply size={14} /> Balas Pesan
              </label>
              <Textarea placeholder="Tulis balasan Anda di sini..." rows={4} />
            </div>

            <div className="flex items-center gap-2">
              <Button variant="premium" size="sm">Kirim Balasan</Button>
              <Button variant="outline" size="sm"><Archive size={14} className="mr-1.5" /> Arsipkan</Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:border-red-200">
                <Trash2 size={14} className="mr-1.5" /> Hapus
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
