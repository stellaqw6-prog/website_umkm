import { Metadata } from "next";
import { FaqSection } from "@/components/home/faq-section";
import { getFaqs } from "@/lib/data";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Temukan jawaban untuk pertanyaan umum seputar belanja di UMKM Store.",
};

export const revalidate = 0;

export default async function FaqPage() {
  const faqs = await getFaqs();

  return (
    <>
      <section className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16 dark:from-stone-950 dark:via-stone-950 dark:to-blue-950/40">
        <div className="container mx-auto px-4 text-center">
          <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider dark:text-blue-400">Bantuan</span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-2 dark:text-stone-100">FAQ</h1>
          <p className="text-gray-500 mt-3 dark:text-stone-400">Pertanyaan yang sering diajukan oleh pelanggan kami</p>
        </div>
      </section>
      <FaqSection faqs={faqs} />
    </>
  );
}
