"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-3xl bg-red-50 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={44} className="text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-3 dark:text-stone-100">Terjadi Kesalahan</h1>
        <p className="text-gray-500 mb-8 dark:text-stone-400">Maaf, ada masalah teknis di halaman ini. Coba muat ulang, atau kembali ke beranda.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="premium" size="lg" onClick={() => reset()} className="w-full sm:w-auto">
            <RotateCw size={18} className="mr-2" /> Coba Lagi
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <Home size={18} className="mr-2" /> Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
