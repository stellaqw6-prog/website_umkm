"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Terjadi kesalahan");
        return;
      }
      setSent(true);
    } catch {
      toast.error("Tidak bisa terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 dark:bg-stone-900"
    >
      <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-6 dark:text-stone-400">
        <ArrowLeft size={15} /> Kembali ke Login
      </Link>

      {sent ? (
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 dark:bg-green-950/30">
            <CheckCircle2 size={28} className="text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2 dark:text-stone-100">Cek Email Kamu</h1>
          <p className="text-gray-500 text-sm dark:text-stone-400">
            Jika email <span className="font-medium text-gray-700 dark:text-stone-300">{email}</span> terdaftar, kami sudah kirim link untuk reset password. Cek inbox atau folder spam.
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-stone-100">Lupa Password?</h1>
          <p className="text-gray-500 text-sm mb-6 dark:text-stone-400">Masukkan email akun kamu, kami akan kirimkan link untuk membuat password baru.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-stone-500" />
                <Input type="email" required placeholder="nama@email.com" className="pl-11" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
            <Button type="submit" variant="premium" size="lg" className="w-full" disabled={loading}>
              {loading ? "Mengirim..." : "Kirim Link Reset"}
            </Button>
          </form>
        </>
      )}
    </motion.div>
  );
}
