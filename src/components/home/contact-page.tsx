"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import toast from "react-hot-toast";

export function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Gagal mengirim pesan, coba lagi");
        return;
      }

      toast.success("Pesan berhasil dikirim! Tim kami akan menghubungi Anda segera.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      toast.error("Tidak bisa terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Kontak</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-2">Hubungi Kami</h1>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">
              Ada pertanyaan? Kami siap membantu. Isi form di bawah atau hubungi langsung.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Contact Info */}
            <div className="space-y-6">
              {[
                { icon: Phone, label: "Telepon", value: "+62 812-3456-7890", href: "tel:+6281234567890" },
                { icon: Mail, label: "Email", value: "info@umkmstore.id", href: "mailto:info@umkmstore.id" },
                { icon: MapPin, label: "Alamat", value: "Jl. Merdeka No. 123, Jakarta, Indonesia", href: "#" },
                { icon: Clock, label: "Jam Kerja", value: "Senin - Jumat, 08:00 - 17:00 WIB", href: "#" },
              ].map((item, i) => (
                <motion.a
                  key={i}
                  href={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                    <item.icon size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{item.label}</p>
                    <p className="font-semibold text-gray-900">{item.value}</p>
                  </div>
                </motion.a>
              ))}

              <div className="p-4 bg-green-50 rounded-2xl">
                <div className="flex items-center gap-2 text-green-700 font-semibold mb-1">
                  <MessageCircle size={18} />
                  Chat WhatsApp
                </div>
                <p className="text-sm text-green-600 mb-3">Respon lebih cepat via WhatsApp</p>
                <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-green-600 hover:bg-green-700 w-full">Chat Sekarang</Button>
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 bg-gray-50 rounded-2xl p-6 md:p-8"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Kirim Pesan</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                    <Input
                      placeholder="Nama Anda"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
                    <Input
                      placeholder="08xxxxxxxxxx"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subjek *</label>
                    <Input
                      placeholder="Subjek pesan"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pesan *</label>
                  <Textarea
                    placeholder="Tulis pesan Anda..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" size="lg" disabled={loading} className="w-full md:w-auto">
                  {loading ? (
                    "Mengirim..."
                  ) : (
                    <>
                      Kirim Pesan <Send size={16} className="ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
