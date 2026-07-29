import { Metadata } from "next";
import { ContactPage } from "@/components/home/contact-page";

export const metadata: Metadata = {
  title: "Kontak Kami",
  description: "Hubungi kami untuk pertanyaan, dukungan, atau kerjasama. Tim UMKM Store siap membantu Anda.",
};

export default function KontakPage() {
  return <ContactPage />;
}
