import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promo & Diskon",
  description: "Dapatkan promo dan diskon terbaik untuk produk UMKM favorit Anda.",
};

export default function PromoPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="text-red-600 font-semibold text-sm uppercase tracking-wider">🎉 Jangan Lewatkan</span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-2">Promo & Diskon</h1>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            Dapatkan penawaran terbaik untuk produk UMKM favorit Anda
          </p>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-md mx-auto bg-gray-50 rounded-2xl p-10">
            <p className="text-6xl mb-4">🏷️</p>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Segera Hadir!</h2>
            <p className="text-gray-500">Promo spesial sedang kami siapkan untuk Anda. Stay tuned!</p>
          </div>
        </div>
      </section>
    </>
  );
}
