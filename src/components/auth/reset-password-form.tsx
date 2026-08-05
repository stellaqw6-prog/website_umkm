"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Link tidak valid. Minta link reset baru.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal reset password");
        return;
      }
      setSuccess(true);
      toast.success("Password berhasil diubah!");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      toast.error("Tidak bisa terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 text-center dark:bg-stone-900">
        <h1 className="text-xl font-bold text-gray-900 mb-2 dark:text-stone-100">Link Tidak Valid</h1>
        <p className="text-gray-500 text-sm mb-6 dark:text-stone-400">Link reset password tidak ditemukan atau sudah tidak berlaku.</p>
        <Link href="/lupa-password"><Button variant="premium">Minta Link Baru</Button></Link>
      </motion.div>
    );
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 text-center dark:bg-stone-900">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-green-600" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2 dark:text-stone-100">Password Berhasil Diubah!</h1>
        <p className="text-gray-500 text-sm dark:text-stone-400">Mengarahkan ke halaman login...</p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 dark:bg-stone-900">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 dark:text-stone-100">Buat Password Baru</h1>
      <p className="text-gray-500 text-sm mb-6 dark:text-stone-400">Masukkan password baru untuk akun kamu.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Password Baru</label>
          <div className="relative">
            <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-stone-500" />
            <Input
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              placeholder="Minimal 6 karakter"
              className="pl-11 pr-11"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-stone-500">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block dark:text-stone-300">Konfirmasi Password</label>
          <Input type={showPassword ? "text" : "password"} required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
        <Button type="submit" variant="premium" size="lg" className="w-full" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Password Baru"}
        </Button>
      </form>
    </motion.div>
  );
}
