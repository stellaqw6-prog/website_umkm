"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, CreditCard, Tag, ShoppingBag, Loader2, Check, X, Copy, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/contexts/cart-context";
import { useSession } from "@/hooks/use-session";
import { AddressForm } from "@/components/checkout/address-form";
import toast from "react-hot-toast";

interface PaymentMethod {
  id: number;
  name: string;
  type: "ewallet" | "bank" | "cod";
  provider: string;
  accountNumber: string;
  accountName: string;
  qrImage: string | null;
  instructions: string | null;
}

export function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { user, loading: sessionLoading } = useSession();

  const [addressValid, setAddressValid] = useState(false);
  const [formattedAddress, setFormattedAddress] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<{ discount: number; freeShipping: boolean; code: string } | null>(null);
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/payment-methods")
      .then((res) => res.json())
      .then((data) => {
        const methods: PaymentMethod[] = data.paymentMethods ?? [];
        setPaymentMethods(methods);
        if (methods.length > 0) setSelectedPaymentId(methods[0].id);
      })
      .catch(() => toast.error("Gagal memuat metode pembayaran"))
      .finally(() => setLoadingPayments(false));
  }, []);

  const selectedMethod = paymentMethods.find((m) => m.id === selectedPaymentId) ?? null;
  const ewalletMethods = paymentMethods.filter((m) => m.type === "ewallet");
  const bankMethods = paymentMethods.filter((m) => m.type === "bank");
  const codMethods = paymentMethods.filter((m) => m.type === "cod");

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Nomor disalin");
  };

  const baseShipping = totalPrice >= 200000 ? 0 : 15000;
  const shipping = promoResult?.freeShipping ? 0 : baseShipping;
  const discount = promoResult?.discount ?? 0;
  const grandTotal = Math.max(totalPrice + shipping - discount, 0);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    setApplyingPromo(true);
    try {
      const res = await fetch("/api/promotions/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, subtotal: totalPrice }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Kode promo tidak valid");
        setPromoResult(null);
        return;
      }
      setPromoResult({ discount: data.discount, freeShipping: data.freeShipping, code: data.code });
      toast.success(`Kode "${data.code}" berhasil dipakai`);
    } catch {
      toast.error("Tidak bisa terhubung ke server");
    } finally {
      setApplyingPromo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("Silakan login dulu untuk checkout");
      router.push("/login?redirect=/checkout");
      return;
    }

    if (!addressValid || !formattedAddress) {
      toast.error("Lengkapi alamat pengiriman (provinsi, kota, kecamatan, kelurahan, kode pos, dan detail alamat)");
      return;
    }

    if (!selectedMethod) {
      toast.error("Pilih metode pembayaran dulu");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, variantId: i.variantId })),
          shippingAddress: formattedAddress,
          paymentMethod: selectedMethod.name,
          notes,
          promoCode: promoResult?.code,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Gagal membuat pesanan");
        return;
      }
      clearCart();
      const createdOrders: { orderNumber: string }[] = data.orders ?? [];
      if (createdOrders.length > 1) {
        toast.success(`${createdOrders.length} pesanan berhasil dibuat (dari toko berbeda)!`);
        router.push(`/checkout/berhasil?ids=${createdOrders.map((o) => o.orderNumber).join(",")}`);
      } else {
        toast.success("Pesanan berhasil dibuat!");
        router.push(`/pesanan/${createdOrders[0].orderNumber}`);
      }
    } catch {
      toast.error("Tidak bisa terhubung ke server");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Keranjang Kosong</h2>
          <p className="text-gray-500 mb-6">Tambahkan produk dulu sebelum checkout.</p>
          <Link href="/produk">
            <Button variant="premium" size="lg">Jelajahi Produk</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!sessionLoading && !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Diperlukan</h2>
          <p className="text-gray-500 mb-6">Silakan login dulu untuk melanjutkan checkout.</p>
          <Link href="/login?redirect=/checkout">
            <Button variant="premium" size="lg">Login Sekarang</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="py-10 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-gray-900 mb-8">
          Checkout
        </motion.h1>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Address */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><MapPin size={18} className="text-blue-600" /> Alamat Pengiriman</h3>
              <AddressForm
                onChange={(_value, isValid, formatted) => {
                  setAddressValid(isValid);
                  setFormattedAddress(formatted);
                }}
              />
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><CreditCard size={18} className="text-blue-600" /> Metode Pembayaran</h3>

              {loadingPayments ? (
                <div className="flex justify-center py-8 text-gray-400"><Loader2 className="animate-spin" size={24} /></div>
              ) : paymentMethods.length === 0 ? (
                <p className="text-sm text-gray-400 py-4">Belum ada metode pembayaran tersedia. Hubungi admin toko.</p>
              ) : (
                <div className="space-y-5">
                  {ewalletMethods.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">E-Wallet</p>
                      <div className="space-y-2">
                        {ewalletMethods.map((m) => (
                          <label
                            key={m.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              selectedPaymentId === m.id ? "border-blue-600 bg-blue-50/50" : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input type="radio" name="payment" checked={selectedPaymentId === m.id} onChange={() => setSelectedPaymentId(m.id)} className="accent-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{m.name}</p>
                              <p className="text-xs text-gray-500">a.n. {m.accountName}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {bankMethods.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Transfer Bank</p>
                      <div className="space-y-2">
                        {bankMethods.map((m) => (
                          <label
                            key={m.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              selectedPaymentId === m.id ? "border-blue-600 bg-blue-50/50" : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input type="radio" name="payment" checked={selectedPaymentId === m.id} onChange={() => setSelectedPaymentId(m.id)} className="accent-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{m.name}</p>
                              <p className="text-xs text-gray-500">a.n. {m.accountName}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {codMethods.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Bayar di Tempat</p>
                      <div className="space-y-2">
                        {codMethods.map((m) => (
                          <label
                            key={m.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              selectedPaymentId === m.id ? "border-blue-600 bg-blue-50/50" : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input type="radio" name="payment" checked={selectedPaymentId === m.id} onChange={() => setSelectedPaymentId(m.id)} className="accent-blue-600" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{m.name}</p>
                              <p className="text-xs text-gray-500">Bayar tunai saat pesanan tiba</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detail pembayaran metode terpilih */}
                  <AnimatePresence mode="wait">
                    {selectedMethod && (
                      <motion.div
                        key={selectedMethod.id}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="rounded-xl border border-blue-100 bg-blue-50/40 p-4"
                      >
                        <p className="text-xs font-semibold text-blue-700 mb-2">Detail Pembayaran {selectedMethod.name}</p>
                        {selectedMethod.type === "cod" ? (
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {selectedMethod.instructions || "Bayar tunai langsung kepada kurir saat pesanan tiba di alamat Anda."}
                          </p>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-xs text-gray-500">
                                  {selectedMethod.type === "bank" ? "Nomor Rekening" : "Nomor HP"}
                                </p>
                                <p className="font-mono font-bold text-gray-900 text-lg">{selectedMethod.accountNumber}</p>
                                <p className="text-xs text-gray-500 mt-0.5">a.n. {selectedMethod.accountName}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleCopy(selectedMethod.accountNumber)}
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-white px-3 py-1.5 rounded-lg border border-blue-200 flex-shrink-0"
                              >
                                <Copy size={13} /> Salin
                              </button>
                            </div>

                            {selectedMethod.qrImage && (
                              <div className="mt-3 flex items-center gap-3">
                                <img src={selectedMethod.qrImage} alt={`QR ${selectedMethod.name}`} className="w-24 h-24 rounded-lg border border-gray-200 object-contain bg-white" />
                                <p className="text-xs text-gray-500 flex items-center gap-1"><QrCode size={13} /> Atau scan QR code di samping</p>
                              </div>
                            )}

                            {selectedMethod.instructions && (
                              <p className="text-xs text-gray-500 mt-3 leading-relaxed">{selectedMethod.instructions}</p>
                            )}
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">Catatan (opsional)</h3>
              <Textarea rows={2} placeholder="Contoh: titip di satpam, jangan dibanting, dll" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 h-fit sticky top-24 space-y-5">
            <h3 className="font-bold text-gray-900">Ringkasan Pesanan</h3>

            <div className="space-y-3 max-h-52 overflow-y-auto">
              {items.map((item) => (
                <div key={`${item.productId}-${item.variantId ?? "base"}`} className="flex gap-3 text-sm">
                  <img src={item.image} alt={item.name} className="w-12 h-14 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 line-clamp-1">{item.name}</p>
                    {item.variantName && <p className="text-gray-400 text-xs">Varian: {item.variantName}</p>}
                    <p className="text-gray-500 text-xs">{item.quantity} x {formatCurrency(item.price)}</p>
                  </div>
                  <span className="font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Promo code */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1"><Tag size={14} /> Kode Promo</label>
              {promoResult ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                  <span className="text-sm font-medium text-green-700 flex items-center gap-1"><Check size={14} /> {promoResult.code}</span>
                  <button type="button" onClick={() => { setPromoResult(null); setPromoCode(""); }} className="text-green-700 hover:text-red-600">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input placeholder="Masukkan kode" value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} />
                  <Button type="button" variant="outline" onClick={handleApplyPromo} disabled={applyingPromo}>
                    {applyingPromo ? <Loader2 className="animate-spin" size={16} /> : "Pakai"}
                  </Button>
                </div>
              )}
            </div>

            <hr />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span className="font-semibold">{formatCurrency(totalPrice)}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pengiriman</span>
                <span className={shipping === 0 ? "text-green-600 font-semibold" : "font-semibold"}>{shipping === 0 ? "GRATIS" : formatCurrency(shipping)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Diskon</span><span className="font-semibold">-{formatCurrency(discount)}</span>
                </div>
              )}
              <hr />
              <div className="flex justify-between text-lg"><span className="font-bold">Total</span><span className="font-bold text-blue-600">{formatCurrency(grandTotal)}</span></div>
            </div>

            <Button type="submit" variant="premium" size="lg" className="w-full" disabled={submitting || !selectedMethod || !addressValid}>
              {submitting ? <Loader2 className="animate-spin" size={18} /> : "Buat Pesanan"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
