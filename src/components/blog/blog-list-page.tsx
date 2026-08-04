"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  category: string | null;
  publishedAt: Date | string | null;
  content: string;
}

function formatDate(date: Date | string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function readTime(content: string) {
  return Math.max(1, Math.round(content.length / 1000));
}

export function BlogListPage({ posts }: { posts: Post[] }) {
  const [featured, ...rest] = posts;

  return (
    <>
      <section className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">Blog</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mt-2 dark:text-gray-100">Artikel & Inspirasi UMKM</h1>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto dark:text-gray-400">Tips, cerita sukses, dan berita terkini seputar UMKM Indonesia</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <FileText size={48} className="text-gray-300 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-1 dark:text-gray-100">Belum ada artikel</h3>
              <p className="text-gray-500 text-sm dark:text-gray-400">Artikel akan segera hadir, nantikan ya!</p>
            </div>
          ) : (
            <>
              {featured && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
                  <Link href={`/blog/${featured.slug}`} className="grid md:grid-cols-2 gap-6 group items-center bg-gray-50 rounded-3xl overflow-hidden dark:bg-gray-900">
                    <div className="aspect-[16/10] overflow-hidden">
                      <img src={featured.coverImage ?? ""} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-6 md:p-8">
                      {featured.category && <Badge className="mb-3">{featured.category}</Badge>}
                      <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors dark:text-gray-100">{featured.title}</h2>
                      <p className="text-gray-500 mb-4 line-clamp-2 dark:text-gray-400">{featured.excerpt}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4 dark:text-gray-500">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(featured.publishedAt)}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {readTime(featured.content)} min baca</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-blue-600 font-semibold text-sm">
                        Baca Selengkapnya <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              )}

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((post, i) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all group dark:bg-gray-900 dark:border-gray-800"
                  >
                    <Link href={`/blog/${post.slug}`} className="block relative aspect-[3/2] overflow-hidden">
                      <img src={post.coverImage ?? ""} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {post.category && <Badge className="absolute top-3 left-3">{post.category}</Badge>}
                    </Link>
                    <div className="p-5">
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-3 dark:text-gray-500">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(post.publishedAt)}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {readTime(post.content)} min</span>
                      </div>
                      <Link href={`/blog/${post.slug}`}>
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors dark:text-gray-100">{post.title}</h3>
                      </Link>
                      <p className="text-sm text-gray-500 line-clamp-2 dark:text-gray-400">{post.excerpt}</p>
                    </div>
                  </motion.article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
