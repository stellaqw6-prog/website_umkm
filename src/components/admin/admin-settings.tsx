"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Globe, Mail, Phone, MapPin, ImageIcon, Loader2, Truck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";

interface Settings {
  siteName: string;
  siteDescription: string | null;
  logo: string | null;
  primaryColor: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  whatsapp: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  twitter: string | null;
  sellerUpgradeFee: string;
  shippingEnabled: boolean;
  defaultShippingCost: string;
  heroBadgeText: string;
  heroTitleLine1: string;
  heroTitleHighlight: string;
  heroTitleLine2: string;
  heroDescription: string | null;
  heroButtonText: string;
  heroButtonUrl: string;
}

const emptySettings: Settings = {
  siteName: "", siteDescription: "", logo: "", primaryColor: "#2563eb",
  phone: "", email: "", address: "", whatsapp: "",
  facebook: "", instagram: "", tiktok: "", youtube: "", twitter: "",
  sellerUpgradeFee: "35000",
  shippingEnabled: true,
  defaultShippingCost: "15000",
  heroBadgeText: "#BanggaBuatanIndonesia 🇮🇩",
  heroTitleLine1: "Dukung",
  heroTitleHighlight: "UMKM Lokal",
  heroTitleLine2: "Indonesia Berkualitas",
  heroDescription: "Temukan produk-produk terbaik dari pengusaha lokal Indonesia. Kualitas premium dengan harga terjangkau, langsung dari tangan kreatif UMKM.",
  heroButtonText: "Jelajahi Produk",
  heroButtonUrl: "/produk",
};

export function AdminSettings() {
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings({ ...emptySettings, ...data.settings });
      })
      .catch(() => toast.error("Gagal memuat pengaturan"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Pastikan tidak ada nilai null yang terkirim (field yang belum pernah diisi
      // tersimpan sebagai null dari database, dan itu bikin validasi di server gagal)
      const payload = Object.fromEntries(
        Object.entries(settings).map(([key, value]) => [key, value ?? ""])
      );

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal menyimpan pengaturan");
        return;
      }
      setSettings({ ...emptySettings, ...data.settings });
      toast.success("Pengaturan berhasil disimpan!");
    } catch {
      toast.error("Tidak bisa terhubung ke server");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24 text-gray-400 dark:text-stone-500">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-stone-100">Pengaturan</h1>
          <p className="text-gray-500 text-sm mt-1 dark:text-stone-400">Konfigurasi website dan bisnis Anda — perubahan langsung tampil di website publik</p>
        </div>
        <Button variant="premium" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={18} className="mr-2" />} Simpan
        </Button>
      </motion.div>

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Globe size={20} className="text-blue-600" /> Informasi Umum</CardTitle>
          <CardDescription>Pengaturan dasar website Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-stone-300">Nama Website</label>
            <Input value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-stone-300">Deskripsi</label>
            <Textarea value={settings.siteDescription ?? ""} onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 dark:text-stone-300"><Mail size={14} /> Email</label>
              <Input type="email" value={settings.email ?? ""} onChange={(e) => setSettings({ ...settings, email: e.target.value })} placeholder="info@tokokamu.id" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 dark:text-stone-300"><Phone size={14} /> Telepon</label>
              <Input value={settings.phone ?? ""} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} placeholder="+62 812-3456-7890" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 dark:text-stone-300"><MapPin size={14} /> Alamat</label>
            <Textarea value={settings.address ?? ""} onChange={(e) => setSettings({ ...settings, address: e.target.value })} rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* Hero Beranda */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles size={20} className="text-blue-600 dark:text-blue-400" /> Hero Beranda</CardTitle>
          <CardDescription>Teks besar paling atas di halaman utama — badge, judul, deskripsi, dan tombol utama</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-stone-300">Teks Badge</label>
            <Input value={settings.heroBadgeText} onChange={(e) => setSettings({ ...settings, heroBadgeText: e.target.value })} placeholder="#BanggaBuatanIndonesia 🇮🇩" />
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-stone-300">Judul — Baris 1</label>
              <Input value={settings.heroTitleLine1} onChange={(e) => setSettings({ ...settings, heroTitleLine1: e.target.value })} placeholder="Dukung" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-stone-300">Judul — Kata Sorotan</label>
              <Input value={settings.heroTitleHighlight} onChange={(e) => setSettings({ ...settings, heroTitleHighlight: e.target.value })} placeholder="UMKM Lokal" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-stone-300">Judul — Baris 2</label>
              <Input value={settings.heroTitleLine2} onChange={(e) => setSettings({ ...settings, heroTitleLine2: e.target.value })} placeholder="Indonesia Berkualitas" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-stone-300">Deskripsi</label>
            <Textarea value={settings.heroDescription ?? ""} onChange={(e) => setSettings({ ...settings, heroDescription: e.target.value })} rows={3} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-stone-300">Teks Tombol</label>
              <Input value={settings.heroButtonText} onChange={(e) => setSettings({ ...settings, heroButtonText: e.target.value })} placeholder="Jelajahi Produk" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-stone-300">Link Tombol</label>
              <Input value={settings.heroButtonUrl} onChange={(e) => setSettings({ ...settings, heroButtonUrl: e.target.value })} placeholder="/produk" />
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-stone-300">Pratinjau</label>
            <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6 dark:border-stone-800 dark:from-stone-950 dark:via-stone-950 dark:to-blue-950/40">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 dark:bg-blue-950/50 dark:text-blue-300">
                {settings.heroBadgeText || "..."}
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold leading-tight text-gray-900 mb-2 dark:text-stone-100">
                {settings.heroTitleLine1}{" "}<span className="text-gradient">{settings.heroTitleHighlight}</span><br />{settings.heroTitleLine2}
              </h3>
              <p className="text-sm text-gray-500 mb-4 dark:text-stone-400">{settings.heroDescription}</p>
              <span className="inline-flex items-center rounded-xl bg-blue-600 text-white text-sm font-semibold px-4 py-2">{settings.heroButtonText || "..."}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle>Media Sosial & WhatsApp</CardTitle>
          <CardDescription>Tautan media sosial dan nomor WhatsApp bisnis Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-stone-300">Nomor WhatsApp</label>
              <Input value={settings.whatsapp ?? ""} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} placeholder="6281234567890 (tanpa +/spasi/strip)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-stone-300">Facebook</label>
              <Input value={settings.facebook ?? ""} onChange={(e) => setSettings({ ...settings, facebook: e.target.value })} placeholder="https://facebook.com/tokokamu" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-stone-300">Instagram</label>
              <Input value={settings.instagram ?? ""} onChange={(e) => setSettings({ ...settings, instagram: e.target.value })} placeholder="https://instagram.com/tokokamu" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-stone-300">TikTok</label>
              <Input value={settings.tiktok ?? ""} onChange={(e) => setSettings({ ...settings, tiktok: e.target.value })} placeholder="https://tiktok.com/@tokokamu" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-stone-300">YouTube</label>
              <Input value={settings.youtube ?? ""} onChange={(e) => setSettings({ ...settings, youtube: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-stone-300">Twitter / X</label>
              <Input value={settings.twitter ?? ""} onChange={(e) => setSettings({ ...settings, twitter: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ImageIcon size={20} className="text-blue-600" /> Branding</CardTitle>
          <CardDescription>Logo dan warna utama website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-stone-300">URL Logo</label>
            <Input value={settings.logo ?? ""} onChange={(e) => setSettings({ ...settings, logo: e.target.value })} placeholder="https://... (link gambar logo)" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-stone-300">Warna Utama</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                className="w-10 h-10 rounded-lg border-0 cursor-pointer"
              />
              <Input value={settings.primaryColor} onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })} className="w-32" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seller */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🏪 Program Seller</CardTitle>
          <CardDescription>Biaya yang harus dibayar pelanggan untuk upgrade jadi seller (buka toko sendiri)</CardDescription>
        </CardHeader>
        <CardContent>
          <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-stone-300">Biaya Upgrade Seller (Rp)</label>
          <Input type="number" value={settings.sellerUpgradeFee} onChange={(e) => setSettings({ ...settings, sellerUpgradeFee: e.target.value })} className="max-w-xs" />
        </CardContent>
      </Card>

      {/* Ongkir Platform */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Truck size={20} className="text-blue-600" /> Ongkir Platform (Default)</CardTitle>
          <CardDescription>
            Ongkir ini dipakai untuk produk yang tidak diatur ongkir khususnya sendiri oleh toko/seller. Bisa di-override per toko di halaman Profil Toko seller, dan per produk saat tambah/edit produk.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-stone-300">
            <input
              type="checkbox"
              checked={settings.shippingEnabled}
              onChange={(e) => setSettings({ ...settings, shippingEnabled: e.target.checked })}
              className="rounded"
            />
            Aktifkan biaya ongkir default platform
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-stone-300">Biaya Ongkir Default (Rp)</label>
            <Input
              type="number"
              value={settings.defaultShippingCost}
              onChange={(e) => setSettings({ ...settings, defaultShippingCost: e.target.value })}
              className="max-w-xs"
              disabled={!settings.shippingEnabled}
            />
            {!settings.shippingEnabled && (
              <p className="text-xs text-gray-400 mt-1 dark:text-stone-500">Nonaktif — semua produk yang ikut aturan default otomatis gratis ongkir.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="premium" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={18} className="mr-2" />} Simpan Pengaturan
        </Button>
      </div>
    </div>
  );
}
