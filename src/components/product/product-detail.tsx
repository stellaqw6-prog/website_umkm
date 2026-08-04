"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Minus, Plus, ShoppingCart, Heart, Truck, ShieldCheck, RotateCcw, ChevronRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/product-card";
import { ProductReviews } from "@/components/product/product-reviews";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import type { ProductCardData } from "@/lib/data";
import toast from "react-hot-toast";

interface ProductVariant {
  id: number;
  name: string;
  price: number | null;
  stock: number;
  sku: string | null;
  image: string | null;
}

interface ProductDetail extends ProductCardData {
  description: string | null;
  categoryName: string | null;
  storeName?: string | null;
  storeSlug?: string | null;
  images: string[];
  variants?: ProductVariant[];
}

export function ProductDetail({
  product,
  relatedProducts,
}: {
  product: ProductDetail;
  relatedProducts: ProductCardData[];
}) {
  const { addItem } = useCart();
  const { productIds, toggle } = useWishlist();
  const liked = productIds.has(product.id);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const variants = product.variants ?? [];
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(variants[0]?.id ?? null);
  const selectedVariant = variants.find((v) => v.id === selectedVariantId) ?? null;

  const effectivePrice = selectedVariant?.price ?? product.price;
  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;

  useEffect(() => {
    setQuantity((q) => Math.max(1, Math.min(q, effectiveStock || 1)));
  }, [selectedVariantId, effectiveStock]);

  const baseImages = product.images.length > 0 ? product.images : [product.image];
  const images = selectedVariant?.image ? [selectedVariant.image, ...baseImages] : baseImages;

  const handleAddToCart = () => {
    if (variants.length > 0 && !selectedVariant) {
      toast.error("Pilih varian dulu");
      return;
    }
    if (effectiveStock <= 0) {
      toast.error("Stok produk habis");
      return;
    }
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: effectivePrice,
        image: selectedVariant?.image ?? product.image,
        stock: effectiveStock,
        variantId: selectedVariant?.id,
        variantName: selectedVariant?.name,
        sellerId: product.sellerId,
        shippingCost: product.shippingCost,
      },
      quantity
    );
    toast.success(`${quantity}x ${product.name}${selectedVariant ? ` (${selectedVariant.name})` : ""} ditambahkan ke keranjang`);
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap dark:text-gray-400">
          <Link href="/" className="hover:text-blue-600">Beranda</Link>
          <ChevronRight size={12} />
          <Link href="/produk" className="hover:text-blue-600">Produk</Link>
          {product.categoryName && (
            <>
              <ChevronRight size={12} />
              <span>{product.categoryName}</span>
            </>
          )}
          <ChevronRight size={12} />
          <span className="text-gray-900 font-medium dark:text-gray-100">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3 dark:bg-gray-800"
            >
              <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              {product.discount > 0 && (
                <Badge variant="destructive" className="absolute top-4 left-4">-{product.discount}%</Badge>
              )}
            </motion.div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImage === i ? "border-blue-600" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.categoryName && (
              <Link href={`/produk?kategori=${product.categoryName.toLowerCase()}`}>
                <Badge variant="secondary" className="mb-3">{product.categoryName}</Badge>
              </Link>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 dark:text-gray-100">{product.name}</h1>

            {product.storeName && (
              <div className="flex items-center gap-1.5 mb-4 text-sm text-gray-500 dark:text-gray-400">
                <Store size={14} className="text-emerald-600" />
                Dijual oleh <span className="font-semibold text-gray-700 dark:text-gray-300">{product.storeName}</span>
              </div>
            )}

            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-gray-900 dark:text-gray-100">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{product.reviewCount} ulasan</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {effectiveStock > 0 ? `Stok ${effectiveStock}` : "Stok habis"}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">{formatCurrency(effectivePrice)}</span>
              {product.compareAtPrice && !selectedVariant?.price && (
                <span className="text-lg text-gray-400 line-through dark:text-gray-500">{formatCurrency(product.compareAtPrice)}</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 mb-6 text-sm">
              <Truck size={15} className={product.shippingCost === 0 ? "text-green-600" : "text-gray-400"} />
              <span className={product.shippingCost === 0 ? "text-green-600 font-semibold" : "text-gray-500"}>
                Ongkir {product.shippingCost === 0 ? "GRATIS" : formatCurrency(product.shippingCost)}
              </span>
            </div>

            {product.description && (
              <p className="text-gray-600 leading-relaxed mb-6 dark:text-gray-400">{product.description}</p>
            )}

            {/* Varian */}
            {variants.length > 0 && (
              <div className="mb-6">
                <span className="text-sm font-semibold text-gray-700 block mb-2 dark:text-gray-300">
                  Pilih Varian{selectedVariant ? `: ${selectedVariant.name}` : ""}
                </span>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVariantId(v.id)}
                      disabled={v.stock <= 0}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                        selectedVariantId === v.id
                          ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                          : v.stock <= 0
                          ? "border-gray-100 text-gray-300 cursor-not-allowed line-through dark:border-gray-800 dark:text-gray-600"
                          : "border-gray-200 text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      {v.name}
                      {v.stock <= 0 && " (Habis)"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Jumlah</span>
              <div className="flex items-center border border-gray-200 rounded-xl dark:border-gray-700">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 text-gray-500 hover:text-blue-600 transition-colors dark:text-gray-400"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-semibold text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(effectiveStock, q + 1))}
                  className="p-2.5 text-gray-500 hover:text-blue-600 transition-colors dark:text-gray-400"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mb-8">
              <Button size="lg" className="flex-1 group" onClick={handleAddToCart} disabled={effectiveStock <= 0}>
                <ShoppingCart size={18} className="mr-2" />
                Tambah ke Keranjang
              </Button>
              <button
                onClick={() => toggle(product.id)}
                className={`p-3.5 rounded-xl border transition-all ${
                  liked ? "bg-red-50 border-red-200 text-red-500 dark:bg-red-950/30 dark:border-red-900" : "border-gray-200 text-gray-400 hover:text-red-500 dark:border-gray-700"
                }`}
              >
                <Heart size={20} fill={liked ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
              <div className="flex flex-col items-center text-center gap-1.5">
                <Truck size={20} className="text-blue-600" />
                <span className="text-[11px] text-gray-500 dark:text-gray-400">Pengiriman Cepat</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <ShieldCheck size={20} className="text-blue-600" />
                <span className="text-[11px] text-gray-500 dark:text-gray-400">100% Original</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <RotateCcw size={20} className="text-blue-600" />
                <span className="text-[11px] text-gray-500 dark:text-gray-400">Garansi Retur 7 Hari</span>
              </div>
            </div>
          </div>
        </div>

        <ProductReviews productId={product.id} productSlug={product.slug} />

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6 dark:text-gray-100">Produk Serupa</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
