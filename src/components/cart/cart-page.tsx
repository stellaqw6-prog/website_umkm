"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/contexts/cart-context";

export function CartPageClient() {
  const { items, updateQuantity, removeItem, totalPrice, estimatedShipping } = useCart();

  const shipping = items.length === 0 ? 0 : estimatedShipping;
  const total = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">Keranjang Kosong</h2>
          <p className="text-gray-500 mb-6 dark:text-gray-400">Yuk, mulai belanja produk UMKM favoritmu!</p>
          <Link href="/produk">
            <Button variant="premium" size="lg">Jelajahi Produk</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="py-12 bg-gray-50 min-h-screen dark:bg-gray-950">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-gray-900 mb-8 dark:text-gray-100">
          Keranjang Belanja ({items.length} item)
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <motion.div
                key={`${item.productId}-${item.variantId ?? "base"}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl p-4 flex gap-4 border border-gray-100 dark:bg-gray-900 dark:border-gray-800"
              >
                <img src={item.image} alt={item.name} className="w-24 h-28 object-cover rounded-xl" />
                <div className="flex-1 min-w-0">
                  <Link href={`/produk/${item.slug}`} className="font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1 dark:text-gray-100">
                    {item.name}
                  </Link>
                  {item.variantName && (
                    <p className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">Varian: {item.variantName}</p>
                  )}
                  <p className="text-blue-600 font-bold mt-1 dark:text-blue-400">{formatCurrency(item.price)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)} className="p-1 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                      <Minus size={14} />
                    </button>
                    <span className="font-semibold text-sm w-8 text-center dark:text-gray-100">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)} className="p-1 rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                      <Plus size={14} />
                    </button>
                    <button onClick={() => removeItem(item.productId, item.variantId)} className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all dark:hover:bg-red-950/40">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-2xl p-6 border border-gray-100 h-fit sticky top-24 dark:bg-gray-900 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 mb-4 dark:text-gray-100">Ringkasan Belanja</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Subtotal</span><span className="font-semibold dark:text-gray-100">{formatCurrency(totalPrice)}</span></div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Pengiriman</span>
                <span className={shipping === 0 ? "text-green-600 font-semibold" : "font-semibold"}>
                  {shipping === 0 ? "GRATIS" : formatCurrency(shipping)}
                </span>
              </div>
              <hr className="dark:border-gray-800" />
              <div className="flex justify-between text-lg"><span className="font-bold dark:text-gray-100">Total</span><span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(total)}</span></div>
            </div>
            <Link href="/checkout">
              <Button variant="premium" size="lg" className="w-full mt-6 group">
                Checkout <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"><ShieldCheck size={14} className="text-green-500" /> Transaksi Aman</div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"><Truck size={14} className="text-blue-500" /> Ongkir dihitung otomatis per toko</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
