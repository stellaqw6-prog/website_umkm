import Link from "next/link";
import { PackageSearch, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-blue-50 px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
          <PackageSearch size={44} className="text-blue-600" />
        </div>
        <h1 className="text-6xl font-extrabold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-900 mb-3">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-8">
          Sepertinya halaman yang kamu cari sudah dipindahkan, dihapus, atau memang tidak pernah ada.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="premium" size="lg" className="w-full sm:w-auto">
              <Home size={18} className="mr-2" /> Kembali ke Beranda
            </Button>
          </Link>
          <Link href="/produk">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              <ShoppingBag size={18} className="mr-2" /> Lihat Produk
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
