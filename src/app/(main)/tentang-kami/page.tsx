import { Metadata } from "next";
import { AboutPage } from "@/components/home/about-page";
import { getPlatformStats } from "@/lib/data";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: "Kenali lebih dekat UMKM Store - platform yang mendukung pertumbuhan UMKM Indonesia melalui digitalisasi dan teknologi modern.",
};

// Ambil data terbaru setiap request supaya angka statistik selalu real-time
export const revalidate = 0;

export default async function AboutUsPage() {
  const stats = await getPlatformStats();
  return <AboutPage stats={stats} foundedYear={2026} />;
}
