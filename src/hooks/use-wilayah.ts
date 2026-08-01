"use client";

import { useEffect, useState } from "react";

export interface WilayahItem {
  id: string;
  name: string;
}

const BASE_URL = "https://www.emsifa.com/api-wilayah-indonesia/api";

async function fetchWilayah(url: string): Promise<WilayahItem[]> {
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Hook untuk dropdown alamat bertingkat: Provinsi -> Kabupaten/Kota -> Kecamatan -> Kelurahan/Desa.
 * Data resmi wilayah Indonesia (Kemendagri), gratis dan tanpa API key.
 */
export function useWilayah() {
  const [provinceId, setProvinceId] = useState("");
  const [regencyId, setRegencyId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [villageId, setVillageId] = useState("");

  const [provinces, setProvinces] = useState<WilayahItem[]>([]);
  const [regencies, setRegencies] = useState<WilayahItem[]>([]);
  const [districts, setDistricts] = useState<WilayahItem[]>([]);
  const [villages, setVillages] = useState<WilayahItem[]>([]);

  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingRegencies, setLoadingRegencies] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // Load provinsi sekali di awal
  useEffect(() => {
    setLoadingProvinces(true);
    fetchWilayah(`${BASE_URL}/provinces.json`)
      .then(setProvinces)
      .finally(() => setLoadingProvinces(false));
  }, []);

  // Saat provinsi berubah -> reset & load kabupaten/kota
  useEffect(() => {
    setRegencyId("");
    setDistrictId("");
    setVillageId("");
    setRegencies([]);
    setDistricts([]);
    setVillages([]);
    if (!provinceId) return;
    setLoadingRegencies(true);
    fetchWilayah(`${BASE_URL}/regencies/${provinceId}.json`)
      .then(setRegencies)
      .finally(() => setLoadingRegencies(false));
  }, [provinceId]);

  // Saat kabupaten/kota berubah -> reset & load kecamatan
  useEffect(() => {
    setDistrictId("");
    setVillageId("");
    setDistricts([]);
    setVillages([]);
    if (!regencyId) return;
    setLoadingDistricts(true);
    fetchWilayah(`${BASE_URL}/districts/${regencyId}.json`)
      .then(setDistricts)
      .finally(() => setLoadingDistricts(false));
  }, [regencyId]);

  // Saat kecamatan berubah -> reset & load kelurahan/desa
  useEffect(() => {
    setVillageId("");
    setVillages([]);
    if (!districtId) return;
    setLoadingVillages(true);
    fetchWilayah(`${BASE_URL}/villages/${districtId}.json`)
      .then(setVillages)
      .finally(() => setLoadingVillages(false));
  }, [districtId]);

  const provinceName = provinces.find((p) => p.id === provinceId)?.name ?? "";
  const regencyName = regencies.find((r) => r.id === regencyId)?.name ?? "";
  const districtName = districts.find((d) => d.id === districtId)?.name ?? "";
  const villageName = villages.find((v) => v.id === villageId)?.name ?? "";

  return {
    provinceId, setProvinceId, provinces, provinceName, loadingProvinces,
    regencyId, setRegencyId, regencies, regencyName, loadingRegencies,
    districtId, setDistrictId, districts, districtName, loadingDistricts,
    villageId, setVillageId, villages, villageName, loadingVillages,
    isComplete: Boolean(provinceId && regencyId && districtId && villageId),
  };
}
