import { Metadata } from "next";
import { AboutPage } from "@/components/home/about-page";

export const metadata: Metadata = {
  title: "Tentang Kami",
  description: "Kenali lebih dekat UMKM Store - platform yang mendukung pertumbuhan UMKM Indonesia melalui digitalisasi dan teknologi modern.",
};

export default function AboutUsPage() {
  return <AboutPage />;
}
