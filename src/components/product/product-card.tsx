"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Star, Heart, ShoppingCart, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/contexts/cart-context";
import { useWishlist } from "@/contexts/wishlist-context";
import type { ProductCardData } from "@/lib/data";
import toast from "react-hot-toast";

export function ProductCard({ product, index = 0 }: { product: ProductCardData; index?: number }) {
  const { addItem } = useCart();
  const { productIds, toggle } = useWishlist();
  const liked = productIds.has(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      toast.error("Stok produk habis");
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
      sellerId: product.sellerId,
      shippingCost: product.shippingCost,
    });
    toast.success(`${product.name} ditambahkan ke keranjang`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 dark:bg-gray-900 dark:border-gray-800 dark:hover:shadow-black/40"
    >
      <Link href={`/produk/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        {product.discount > 0 && (
          <Badge variant="destructive" className="absolute top-3 left-3 text-xs">
            -{product.discount}%
          </Badge>
        )}
        {product.isNew && (
          <Badge variant="premium" className="absolute top-3 right-3 text-xs">
            NEW
          </Badge>
        )}
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center dark:bg-gray-950/70">
            <Badge variant="secondary" className="text-xs">Stok Habis</Badge>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300">
          <div className="absolute right-3 top-12 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(product.id); }}
              className={`p-2 rounded-xl ${
                liked ? "bg-red-500 text-white" : "bg-white text-gray-600 hover:text-red-500 dark:bg-gray-800 dark:text-gray-300"
              } shadow-sm transition-all`}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} />
            </button>
            <span
              className="p-2 rounded-xl bg-white text-gray-600 shadow-sm inline-flex dark:bg-gray-800 dark:text-gray-300"
              aria-hidden="true"
            >
              <Eye size={16} />
            </span>
            <button
              onClick={handleAddToCart}
              className="p-2 rounded-xl bg-white text-gray-600 hover:text-blue-600 shadow-sm transition-all dark:bg-gray-800 dark:text-gray-300"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
        {product.isBestSeller && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="warning" className="text-[10px]">🔥 Best Seller</Badge>
          </div>
        )}
      </Link>

      <div className="p-4">
        <Link href={`/produk/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors dark:text-gray-100">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-1 mb-2">
          <Star size={14} className="text-yellow-500 fill-yellow-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{product.rating.toFixed(1)}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">({product.reviewCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 dark:text-gray-100">{formatCurrency(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-gray-400 line-through dark:text-gray-500">{formatCurrency(product.compareAtPrice)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
