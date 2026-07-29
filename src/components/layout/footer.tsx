"use client";

import Link from "next/link";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Globe,
  Video,
  AtSign,
  Music,
  ArrowUpRight,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import toast from "react-hot-toast";

const footerLinks = {
  produk: [
    { label: "Semua Produk", href: "/produk" },
    { label: "Best Seller", href: "/produk?sort=best-seller" },
    { label: "Produk Terbaru", href: "/produk?sort=terbaru" },
    { label: "Flash Sale", href: "/flash-sale" },
    { label: "Promo", href: "/promo" },
  ],
  perusahaan: [
    { label: "Tentang Kami", href: "/tentang-kami" },
    { label: "Karir", href: "/karir" },
    { label: "Mitra", href: "/mitra" },
    { label: "Blog", href: "/blog" },
    { label: "Kontak", href: "/kontak" },
  ],
  bantuan: [
    { label: "FAQ", href: "/faq" },
    { label: "Cara Belanja", href: "/cara-belanja" },
    { label: "Pengiriman", href: "/pengiriman" },
    { label: "Retur & Refund", href: "/retur" },
    { label: "Tracking Pesanan", href: "/tracking" },
  ],
  legal: [
    { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
    { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
  ],
};

export function Footer() {
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Terima kasih telah berlangganan! 🎉");
    setEmail("");
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      {/* Newsletter */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Dapatkan Info Terbaru
            </h3>
            <p className="text-gray-500 mb-6">
              Berlangganan newsletter kami untuk mendapatkan promo eksklusif dan info produk terbaru.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="premium">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-blue-500/25">
                U
              </div>
              <span className="text-xl font-bold">
                <span className="text-gray-900">UMKM</span>
                <span className="text-blue-600">Store</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm">
              Platform UMKM terpercaya yang menyediakan produk-produk berkualitas dari pengusaha lokal Indonesia. 
              #BanggaBuatanIndonesia
            </p>
            <div className="flex items-center gap-2">
              {[
                { icon: MessageCircle, href: "#", color: "hover:bg-pink-50 hover:text-pink-600", label: "Instagram" },
                { icon: Globe, href: "#", color: "hover:bg-blue-50 hover:text-blue-600", label: "Facebook" },
                { icon: Video, href: "#", color: "hover:bg-red-50 hover:text-red-600", label: "Youtube" },
                { icon: AtSign, href: "#", color: "hover:bg-sky-50 hover:text-sky-600", label: "Twitter" },
                { icon: Music, href: "#", color: "hover:bg-gray-100 hover:text-gray-900", label: "TikTok" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-xl text-gray-400 transition-all ${social.color}`}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, links]) => (
            <div key={key}>
              <h4 className="font-semibold text-gray-900 mb-4 capitalize">{key}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight
                        size={12}
                        className="opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400 flex items-center gap-1">
            © {new Date().getFullYear()} UMKM Store. Made with <Heart size={14} className="text-red-500 fill-red-500" /> in Indonesia.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <Link href="/kebijakan-privasi" className="hover:text-blue-600 transition-colors">
              Privasi
            </Link>
            <Link href="/syarat-ketentuan" className="hover:text-blue-600 transition-colors">
              Ketentuan
            </Link>
            <Link href="/sitemap.xml" className="hover:text-blue-600 transition-colors">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
