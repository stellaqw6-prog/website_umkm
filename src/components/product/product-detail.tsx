"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Minus, Plus, ShoppingCart, Heart, Truck, ShieldCheck, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/components/product/product-card";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/contexts/cart-context";
import type { ProductCardData } from "@/lib/data";
import toast from "react-hot-toast";

interface ProductDetail extends ProductCardData {
  description: string | null;
  categoryName: string | null;
  images: string[];
}

export function ProductDetail({
  product,
  relatedProducts,
}: {
  product: ProductDetail;
  relatedProducts: ProductCardData[];
}) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [liked, setLiked] = useState(false);

  const images = product.images.length > 0 ? product.images : [product.image];

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error("Stok produk habis");
      return;
    }
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
      },
      quantity
    );
    toast.success(`${quantity}x ${product.name} ditambahkan ke keranjang`);
  };

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex items-center gap-1.5 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
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
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3"
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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                <span className="font-semibold text-gray-900">{product.rating.toFixed(1)}</span>
              </div>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">{product.reviewCount} ulasan</span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-500">
                {product.stock > 0 ? `Stok ${product.stock}` : "Stok habis"}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl font-extrabold text-gray-900">{formatCurrency(product.price)}</span>
              {product.compareAtPrice && (
                <span className="text-lg text-gray-400 line-through">{formatCurrency(product.compareAtPrice)}</span>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm font-semibold text-gray-700">Jumlah</span>
              <div className="flex items-center border border-gray-200 rounded-xl">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-2.5 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-semibold text-sm">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="p-2.5 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mb-8">
              <Button size="lg" className="flex-1 group" onClick={handleAddToCart} disabled={product.stock <= 0}>
                <ShoppingCart size={18} className="mr-2" />
                Tambah ke Keranjang
              </Button>
              <button
                onClick={() => setLiked(!liked)}
                className={`p-3.5 rounded-xl border transition-all ${
                  liked ? "bg-red-50 border-red-200 text-red-500" : "border-gray-200 text-gray-400 hover:text-red-500"
                }`}
              >
                <Heart size={20} fill={liked ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-6">
              <div className="flex flex-col items-center text-center gap-1.5">
                <Truck size={20} className="text-blue-600" />
                <span className="text-[11px] text-gray-500">Pengiriman Cepat</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <ShieldCheck size={20} className="text-blue-600" />
                <span className="text-[11px] text-gray-500">100% Original</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5">
                <RotateCcw size={20} className="text-blue-600" />
                <span className="text-[11px] text-gray-500">Garansi Retur 7 Hari</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Produk Serupa</h2>
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
