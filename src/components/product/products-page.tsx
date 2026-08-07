"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, ChevronDown, X, PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/product/product-card";
import type { ProductCardData } from "@/lib/data";

const sortOptions = ["Terbaru", "Terpopuler", "Harga Terendah", "Harga Tertinggi", "Rating Tertinggi"];

interface CategoryOption {
  name: string;
  slug: string;
}

export function ProductsPage() {
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<CategoryOption[]>([{ name: "Semua", slug: "semua" }]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("kategori") ?? "semua");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") ?? "Terbaru");
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState<number | null>(null);

  const [products, setProducts] = useState<ProductCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories([
          { name: "Semua", slug: "semua" },
          ...(data.categories ?? []).map((c: { name: string; slug: string }) => ({ name: c.name, slug: c.slug })),
        ]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory !== "semua") params.set("kategori", selectedCategory);
    if (sortBy) params.set("sort", sortBy);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minRating) params.set("minRating", String(minRating));

    setLoading(true);
    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, selectedCategory, sortBy, minPrice, maxPrice, minRating]);

  const resetFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setMinRating(null);
  };

  const skeletons = useMemo(() => Array.from({ length: 8 }), []);

  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16 dark:from-stone-950 dark:via-stone-950 dark:to-blue-950/40">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Katalog</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-2 dark:text-stone-100">Semua Produk UMKM</h1>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto dark:text-stone-400">
              Temukan produk berkualitas dari UMKM terbaik di seluruh Indonesia
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters & Products */}
      <section className="py-12 bg-white dark:bg-stone-900">
        <div className="container mx-auto px-4">
          {/* Search & Sort Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-stone-500" size={18} />
              <Input
                placeholder="Cari produk..."
                className="pl-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <SlidersHorizontal size={16} />
                Filter
              </Button>
              <div className="relative group">
                <Button variant="outline" className="flex items-center gap-2">
                  {sortBy}
                  <ChevronDown size={16} />
                </Button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-xl py-2 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all dark:bg-stone-900 dark:border-stone-800">
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSortBy(option)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-stone-800 transition-colors ${
                        sortBy === option ? "text-blue-600 font-semibold dark:text-blue-400" : "text-gray-700 dark:text-stone-300"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.slug
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-stone-700"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="bg-gray-50 rounded-2xl p-6 mb-8 overflow-hidden dark:bg-stone-900"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-stone-100">Filter Produk</h3>
                <button onClick={() => setShowFilters(false)} className="text-gray-400 hover:text-gray-600 dark:text-stone-500">
                  <X size={18} />
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block dark:text-stone-300">Rentang Harga (Rp)</label>
                  <div className="flex gap-2">
                    <Input placeholder="Min" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                    <Input placeholder="Max" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block dark:text-stone-300">Rating Minimum</label>
                  <div className="flex gap-1">
                    {[4, 3, 2, 1].map((r) => (
                      <button
                        key={r}
                        onClick={() => setMinRating(minRating === r ? null : r)}
                        className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                          minRating === r
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "bg-white border-gray-200 hover:border-blue-500 dark:bg-stone-900 dark:border-stone-700"
                        }`}
                      >
                        ⭐ {r}+
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4 gap-2">
                <Button variant="ghost" size="sm" onClick={resetFilters}>Reset</Button>
                <Button size="sm" onClick={() => setShowFilters(false)}>Terapkan</Button>
              </div>
            </motion.div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {skeletons.map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-2xl overflow-hidden dark:bg-stone-900">
                  <div className="aspect-[4/5] skeleton" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-3/4 skeleton" />
                    <div className="h-3 w-1/2 skeleton" />
                    <div className="h-5 w-1/3 skeleton" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <PackageX size={48} className="text-gray-300 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-1 dark:text-stone-100">Produk tidak ditemukan</h3>
              <p className="text-gray-500 text-sm dark:text-stone-400">Coba ubah kata kunci pencarian atau filter Anda</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
