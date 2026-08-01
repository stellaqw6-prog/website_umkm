"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, User, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useWilayah } from "@/hooks/use-wilayah";

export interface AddressFormValue {
  recipientName: string;
  phone: string;
  provinceName: string;
  regencyName: string;
  districtName: string;
  villageName: string;
  postalCode: string;
  detail: string;
}

const selectClass =
  "w-full h-10 rounded-lg border border-gray-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400";

export function AddressForm({
  onChange,
}: {
  onChange: (value: AddressFormValue, isValid: boolean, formatted: string) => void;
}) {
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [detail, setDetail] = useState("");

  const wilayah = useWilayah();

  const value: AddressFormValue = useMemo(
    () => ({
      recipientName,
      phone,
      provinceName: wilayah.provinceName,
      regencyName: wilayah.regencyName,
      districtName: wilayah.districtName,
      villageName: wilayah.villageName,
      postalCode,
      detail,
    }),
    [recipientName, phone, wilayah.provinceName, wilayah.regencyName, wilayah.districtName, wilayah.villageName, postalCode, detail]
  );

  const isValid =
    recipientName.trim().length >= 3 &&
    phone.trim().length >= 9 &&
    wilayah.isComplete &&
    postalCode.trim().length >= 5 &&
    detail.trim().length >= 10;

  const formatted = useMemo(() => {
    if (!isValid) return "";
    return [
      `Penerima: ${recipientName} (${phone})`,
      detail,
      `Kel./Desa ${wilayah.villageName}, Kec. ${wilayah.districtName}`,
      `${wilayah.regencyName}, ${wilayah.provinceName} ${postalCode}`,
    ].join("\n");
  }, [isValid, recipientName, phone, detail, wilayah.villageName, wilayah.districtName, wilayah.regencyName, wilayah.provinceName, postalCode]);

  useEffect(() => {
    onChange(value, isValid, formatted);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isValid, formatted]);

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1"><User size={14} /> Nama Penerima</label>
          <Input required placeholder="Nama lengkap penerima" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1"><Phone size={14} /> Nomor HP</label>
          <Input required placeholder="08xxxxxxxxxx" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Provinsi</label>
          <div className="relative">
            <select
              required
              className={selectClass}
              value={wilayah.provinceId}
              onChange={(e) => wilayah.setProvinceId(e.target.value)}
              disabled={wilayah.loadingProvinces}
            >
              <option value="">{wilayah.loadingProvinces ? "Memuat provinsi..." : "Pilih Provinsi"}</option>
              {wilayah.provinces.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {wilayah.loadingProvinces && <Loader2 className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Kabupaten/Kota</label>
          <div className="relative">
            <select
              required
              className={selectClass}
              value={wilayah.regencyId}
              onChange={(e) => wilayah.setRegencyId(e.target.value)}
              disabled={!wilayah.provinceId || wilayah.loadingRegencies}
            >
              <option value="">
                {!wilayah.provinceId ? "Pilih provinsi dulu" : wilayah.loadingRegencies ? "Memuat..." : "Pilih Kabupaten/Kota"}
              </option>
              {wilayah.regencies.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            {wilayah.loadingRegencies && <Loader2 className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Kecamatan</label>
          <div className="relative">
            <select
              required
              className={selectClass}
              value={wilayah.districtId}
              onChange={(e) => wilayah.setDistrictId(e.target.value)}
              disabled={!wilayah.regencyId || wilayah.loadingDistricts}
            >
              <option value="">
                {!wilayah.regencyId ? "Pilih kabupaten/kota dulu" : wilayah.loadingDistricts ? "Memuat..." : "Pilih Kecamatan"}
              </option>
              {wilayah.districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {wilayah.loadingDistricts && <Loader2 className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Kelurahan/Desa</label>
          <div className="relative">
            <select
              required
              className={selectClass}
              value={wilayah.villageId}
              onChange={(e) => wilayah.setVillageId(e.target.value)}
              disabled={!wilayah.districtId || wilayah.loadingVillages}
            >
              <option value="">
                {!wilayah.districtId ? "Pilih kecamatan dulu" : wilayah.loadingVillages ? "Memuat..." : "Pilih Kelurahan/Desa"}
              </option>
              {wilayah.villages.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
            {wilayah.loadingVillages && <Loader2 className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-300" size={14} />}
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Kode Pos</label>
        <Input required placeholder="Contoh: 40123" value={postalCode} onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 5))} className="max-w-[160px]" />
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 mb-1.5 block">Alamat Lengkap (Jalan, RT/RW, Nomor Rumah, Patokan)</label>
        <Textarea
          required
          rows={3}
          placeholder="Contoh: Jl. Melati No. 12, RT 03/RW 05, dekat Masjid Al-Ikhlas"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />
      </div>

      {!wilayah.isComplete && !wilayah.loadingProvinces && (
        <p className="text-xs text-amber-600">Lengkapi Provinsi hingga Kelurahan/Desa agar alamat pengiriman valid.</p>
      )}
    </div>
  );
}
