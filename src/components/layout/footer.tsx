"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
import toast from "react-hot-toast";

interface SiteSettings {
  siteName: string;
  siteDescription: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  whatsapp: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  twitter: string | null;
}

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
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => setSettings(data.settings ?? null))
      .catch(() => {});
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal berlangganan");
        return;
      }
      toast.success("Terima kasih telah berlangganan! 🎉");
      setEmail("");
    } catch {
      toast.error("Tidak bisa terhubung ke server");
    } finally {
      setSubscribing(false);
    }
  };

  const siteName = settings?.siteName ?? "UMKM Store";
  const [firstWord, ...restWords] = siteName.split(" ");
  const restWord = restWords.join(" ");

  const socials = [
    { icon: MessageCircle, href: settings?.instagram, color: "hover:bg-pink-50 hover:text-pink-600", label: "Instagram" },
    { icon: Globe, href: settings?.facebook, color: "hover:bg-blue-50 hover:text-blue-600", label: "Facebook" },
    { icon: Video, href: settings?.youtube, color: "hover:bg-red-50 hover:text-red-600", label: "Youtube" },
    { icon: AtSign, href: settings?.twitter, color: "hover:bg-sky-50 hover:text-sky-600", label: "Twitter" },
    { icon: Music, href: settings?.tiktok, color: "hover:bg-gray-100 hover:text-gray-900", label: "TikTok" },
  ].filter((s) => s.href);

  return (
    <footer className="bg-gray-50 border-t border-gray-100 dark:bg-stone-950 dark:border-stone-800">
      {/* Newsletter */}
      <div className="border-b border-gray-200 dark:border-stone-800">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-2 dark:text-stone-100">
              Dapatkan Info Terbaru
            </h3>
            <p className="text-gray-500 mb-6 dark:text-stone-400">
              Berlangganan newsletter kami untuk mendapatkan promo eksklusif dan info produk terbaru.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button type="submit" variant="premium" disabled={subscribing}>
                {subscribing ? "..." : "Subscribe"}
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
                {firstWord.charAt(0)}
              </div>
              <span className="text-xl font-bold">
                <span className="text-gray-900 dark:text-stone-100">{firstWord}</span>
                {restWord && <span className="text-blue-600">{restWord}</span>}
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-sm dark:text-stone-400">
              {settings?.siteDescription ?? "Platform UMKM terpercaya yang menyediakan produk-produk berkualitas dari pengusaha lokal Indonesia."}
            </p>
            {(settings?.phone || settings?.email || settings?.address) && (
              <div className="space-y-1.5 mb-4 text-sm text-gray-500 dark:text-stone-400">
                {settings?.phone && <p className="flex items-center gap-2"><Phone size={13} /> {settings.phone}</p>}
                {settings?.email && <p className="flex items-center gap-2"><Mail size={13} /> {settings.email}</p>}
                {settings?.address && <p className="flex items-center gap-2"><MapPin size={13} /> {settings.address}</p>}
              </div>
            )}
            {socials.length > 0 && (
              <div className="flex items-center gap-2">
                {socials.map((social, i) => (
                  <a
                    key={i}
                    href={social.href!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-xl text-gray-400 transition-all dark:bg-stone-900 dark:text-stone-500 ${social.color}`}
                  >
                    <social.icon size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, links]) => (
            <div key={key}>
              <h4 className="font-semibold text-gray-900 mb-4 capitalize dark:text-stone-100">{key}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-1 group dark:text-stone-400 dark:hover:text-blue-400"
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
      <div className="border-t border-gray-200 dark:border-stone-800">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400 flex items-center gap-1 dark:text-stone-500">
            © {new Date().getFullYear()} {siteName}. Made with <Heart size={14} className="text-red-500 fill-red-500" /> in Indonesia.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-400 dark:text-stone-500">
            <Link href="/kebijakan-privasi" className="hover:text-blue-600 transition-colors dark:hover:text-blue-400">
              Privasi
            </Link>
            <Link href="/syarat-ketentuan" className="hover:text-blue-600 transition-colors dark:hover:text-blue-400">
              Ketentuan
            </Link>
            <Link href="/sitemap.xml" className="hover:text-blue-600 transition-colors dark:hover:text-blue-400">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
