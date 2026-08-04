"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Save, Store, Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";

interface StoreData {
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  banner: string | null;
  phone: string | null;
  address: string | null;
  shippingEnabled: boolean;
  shippingCost: string | null;
}

export function SellerSettings() {
  const [store, setStore] = useState<StoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/seller/store")
      .then((res) => res.json())
      .then((data) => setStore(data.store ?? null))
      .catch(() => toast.error("Gagal memuat profil toko"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!store) return;
    setSaving(true);
    try {
      // Sama seperti Pengaturan Platform: field yang belum pernah diisi tersimpan null dari
      // database, jadi dibersihkan dulu sebelum dikirim biar tidak gagal validasi di server.
      const payload = {
        ...store,
        description: store.description ?? "",
        logo: store.logo ?? "",
        banner: store.banner ?? "",
        phone: store.phone ?? "",
        address: store.address ?? "",
      };
      const res = await fetch("/api/seller/store", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Gagal menyimpan"); return; }
      setStore(data.store);
      toast.success("Profil toko berhasil disimpan!");
    } catch { toast.error("Tidak bisa terhubung ke server"); } finally { setSaving(false); }
  };

  if (loading) {
    return <div className="flex justify-center py-24 text-gray-400 dark:text-gray-500"><Loader2 className="animate-spin" size={32} /></div>;
  }
  if (!store) return <p className="text-center py-24 text-gray-400 text-sm dark:text-gray-500">Profil toko tidak ditemukan.</p>;

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profil Toko</h1>
          <p className="text-gray-500 text-sm mt-1 dark:text-gray-400">Info toko ini akan tampil ke pelanggan</p>
        </div>
        <Button variant="premium" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={18} className="mr-2" />} Simpan
        </Button>
      </motion.div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Store size={20} className="text-emerald-600" /> Informasi Toko</CardTitle>
          <CardDescription>Slug: <span className="font-mono">/{store.slug}</span> (tidak bisa diubah)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Nama Toko</label>
            <Input value={store.name} onChange={(e) => setStore({ ...store, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Deskripsi Toko</label>
            <Textarea value={store.description ?? ""} onChange={(e) => setStore({ ...store, description: e.target.value })} rows={3} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Nomor HP/WhatsApp</label>
              <Input value={store.phone ?? ""} onChange={(e) => setStore({ ...store, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Alamat</label>
            <Textarea value={store.address ?? ""} onChange={(e) => setStore({ ...store, address: e.target.value })} rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">URL Logo Toko</label>
            <Input value={store.logo ?? ""} onChange={(e) => setStore({ ...store, logo: e.target.value })} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">URL Banner Toko</label>
            <Input value={store.banner ?? ""} onChange={(e) => setStore({ ...store, banner: e.target.value })} placeholder="https://..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Truck size={20} className="text-emerald-600" /> Ongkir Toko</CardTitle>
          <CardDescription>
            Ongkir default untuk semua produk di toko ini. Bisa di-override lagi untuk produk tertentu saat tambah/edit produk. Kosongkan harga untuk ikut ongkir default platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={store.shippingEnabled}
              onChange={(e) => setStore({ ...store, shippingEnabled: e.target.checked })}
              className="rounded"
            />
            Aktifkan biaya ongkir untuk toko ini
          </label>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">Biaya Ongkir Toko (Rp)</label>
            <Input
              type="number"
              value={store.shippingCost ?? ""}
              onChange={(e) => setStore({ ...store, shippingCost: e.target.value === "" ? null : e.target.value })}
              placeholder="Kosongkan = pakai ongkir default platform"
              className="max-w-xs"
              disabled={!store.shippingEnabled}
            />
            {!store.shippingEnabled && (
              <p className="text-xs text-gray-400 mt-1 dark:text-gray-500">Nonaktif — semua produk toko ini otomatis gratis ongkir (kecuali diatur khusus per produk).</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="premium" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="animate-spin mr-2" size={16} /> : <Save size={18} className="mr-2" />} Simpan Profil
        </Button>
      </div>
    </div>
  );
}
