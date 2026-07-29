"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const posts = [
  {
    id: 1,
    title: "Tips Memilih Produk UMKM Berkualitas untuk Bisnis Anda",
    excerpt: "Pelajari cara memilih produk UMKM yang tepat untuk bisnis Anda dengan panduan lengkap dari para ahli.",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=500&fit=crop",
    category: "Bisnis",
    author: "Tim UMKM Store",
    date: "15 Jan 2026",
    readTime: "5 min",
    featured: true,
  },
  {
    id: 2,
    title: "Kisah Sukses: UMKM Lokal Tembus Pasar Internasional",
    excerpt: "Bagaimana UMKM Indonesia berhasil menembus pasar global dengan produk berkualitas dan strategi digital.",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&h=500&fit=crop",
    category: "Inspirasi",
    author: "Anita Wijaya",
    date: "12 Jan 2026",
    readTime: "7 min",
    featured: false,
  },
  {
    id: 3,
    title: "Tren Produk UMKM 2026: Peluang Bisnis Menjanjikan",
    excerpt: "Simak prediksi tren produk UMKM yang akan booming di tahun 2026.",
    image: "https://images.unsplash.com/photo-1553729459-afe8f8e20a61?w=800&h=500&fit=crop",
    category: "Tren",
    author: "Budi Santoso",
    date: "8 Jan 2026",
    readTime: "4 min",
    featured: false,
  },
  {
    id: 4,
    title: "Panduan Lengkap Digital Marketing untuk UMKM",
    excerpt: "Strategi digital marketing yang efektif untuk meningkatkan penjualan UMKM Anda.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop",
    category: "Marketing",
    author: "Rina Anggraini",
    date: "5 Jan 2026",
    readTime: "8 min",
    featured: false,
  },
];

export function BlogListPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Blog</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-2">Artikel & Inspirasi</h1>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">
              Tips, inspirasi, dan berita seputar dunia UMKM Indonesia
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all group"
              >
                <Link href={`/blog/${post.id}`} className="block relative aspect-[3/2] overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <Badge className="absolute top-3 left-3">{post.category}</Badge>
                </Link>
                <div className="p-5">
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                  </div>
                  <Link href={`/blog/${post.id}`}>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-500 line-clamp-2">{post.excerpt}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
