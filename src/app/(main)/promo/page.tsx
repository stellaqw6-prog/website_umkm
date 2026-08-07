import { Metadata } from "next";
import { getActivePromotions } from "@/lib/data";
import { PromoGrid } from "@/components/promo/promo-grid";

export const metadata: Metadata = {
  title: "Promo & Diskon",
  description: "Dapatkan promo dan diskon terbaik untuk produk UMKM favorit Anda.",
};

export const revalidate = 0;

export default async function PromoPage() {
  const promotions = await getActivePromotions();

  return (
    <>
      <section className="bg-gradient-to-br from-red-50 via-white to-orange-50 py-16 dark:from-red-950/30 dark:via-stone-950 dark:to-orange-950/20">
        <div className="container mx-auto px-4 text-center">
          <span className="text-red-600 font-semibold text-sm uppercase tracking-wider dark:text-red-400">🎉 Jangan Lewatkan</span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-2 dark:text-stone-100">Promo & Diskon</h1>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto dark:text-stone-400">
            Dapatkan penawaran terbaik untuk produk UMKM favorit Anda. Klik kode untuk menyalin.
          </p>
        </div>
      </section>
      <section className="py-16 bg-white dark:bg-stone-950">
        <div className="container mx-auto px-4">
          <PromoGrid promotions={promotions} />
        </div>
      </section>
    </>
  );
}
