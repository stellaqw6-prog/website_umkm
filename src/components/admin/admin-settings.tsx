"use client";

import { motion } from "framer-motion";
import { Save, Globe, Mail, Phone, MapPin, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import toast from "react-hot-toast";

export function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: "UMKM Store",
    siteDescription: "Platform UMKM terpercaya Indonesia",
    email: "info@umkmstore.id",
    phone: "+62 812-3456-7890",
    address: "Jl. Merdeka No. 123, Jakarta",
    whatsapp: "6281234567890",
    facebook: "https://facebook.com/umkmstore",
    instagram: "https://instagram.com/umkmstore",
    tiktok: "https://tiktok.com/@umkmstore",
  });

  const handleSave = () => {
    toast.success("Pengaturan berhasil disimpan!");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>
          <p className="text-gray-500 text-sm mt-1">Konfigurasi website dan bisnis Anda</p>
        </div>
        <Button variant="premium" onClick={handleSave}>
          <Save size={18} className="mr-2" /> Simpan
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Website</label>
            <Input value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
            <Textarea value={settings.siteDescription} onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Mail size={14} /> Email</label>
              <Input value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><Phone size={14} /> Telepon</label>
              <Input value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1"><MapPin size={14} /> Alamat</label>
            <Textarea value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} rows={2} />
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle>Media Sosial</CardTitle>
          <CardDescription>Tautan media sosial bisnis Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <Input value={settings.whatsapp} onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })} placeholder="6281234567890" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
              <Input value={settings.facebook} onChange={(e) => setSettings({ ...settings, facebook: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <Input value={settings.instagram} onChange={(e) => setSettings({ ...settings, instagram: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">TikTok</label>
              <Input value={settings.tiktok} onChange={(e) => setSettings({ ...settings, tiktok: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Image size={20} className="text-blue-600" /> Branding</CardTitle>
          <CardDescription>Logo, favicon, dan warna website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer">
              <Image size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Klik untuk upload logo</p>
              <p className="text-xs text-gray-400">PNG, JPG (max 2MB)</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Warna Utama</label>
            <div className="flex items-center gap-3">
              <input type="color" defaultValue="#2563eb" className="w-10 h-10 rounded-lg border-0 cursor-pointer" />
              <Input value="#2563eb" readOnly className="w-32" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
