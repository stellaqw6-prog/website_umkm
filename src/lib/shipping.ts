/**
 * Aturan prioritas ongkir (dari yang paling spesifik ke paling umum):
 * 1. Produk di-set "Gratis Ongkir" → selalu Rp0, apapun pengaturan lain.
 * 2. Produk punya harga ongkir sendiri (shippingCost diisi) → pakai itu.
 * 3. Toko seller matikan ongkir (shippingEnabled = false) → Rp0 untuk semua produk toko itu.
 * 4. Toko seller punya harga ongkir sendiri → pakai itu.
 * 5. Platform matikan ongkir (shippingEnabled = false) → Rp0.
 * 6. Fallback terakhir: harga ongkir default platform.
 */

export interface ShippingProductInput {
  freeShipping: boolean;
  shippingCost: string | number | null;
}

export interface ShippingStoreInput {
  shippingEnabled: boolean;
  shippingCost: string | number | null;
}

export interface ShippingSiteInput {
  shippingEnabled: boolean;
  defaultShippingCost: string | number;
}

export function computeProductShippingCost(
  product: ShippingProductInput,
  store: ShippingStoreInput | null,
  site: ShippingSiteInput
): number {
  if (product.freeShipping) return 0;

  if (product.shippingCost !== null && product.shippingCost !== undefined) {
    return Number(product.shippingCost);
  }

  if (store) {
    if (!store.shippingEnabled) return 0;
    if (store.shippingCost !== null && store.shippingCost !== undefined) {
      return Number(store.shippingCost);
    }
  }

  if (!site.shippingEnabled) return 0;
  return Number(site.defaultShippingCost);
}

/**
 * Satu order = satu kali pengiriman dari satu seller, jadi ongkirnya bukan dijumlah
 * per item, tapi diambil yang PALING MAHAL di antara produk-produk dalam order itu
 * (asumsi umum: ongkos kirim ditentukan oleh item paling "berat biaya" dalam 1 paket).
 */
export function computeGroupShippingCost(perItemCosts: number[]): number {
  if (perItemCosts.length === 0) return 0;
  return Math.max(...perItemCosts);
}
