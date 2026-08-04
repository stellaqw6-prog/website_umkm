"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { blogPosts as blogPostsTable } from "@/db/schema";

type BlogPost = typeof blogPostsTable.$inferSelect;

function formatDate(date: Date | string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export function BlogSection({ posts }: { posts: BlogPost[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="py-20 bg-gray-50/50 dark:bg-gray-900/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-end justify-between mb-12"
        >
          <div>
            <span className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
              Blog
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 dark:text-gray-100">
              Artikel Terbaru
            </h2>
            <p className="text-gray-500 mt-2 dark:text-gray-400">
              Tips, inspirasi, dan berita seputar UMKM Indonesia
            </p>
          </div>
          <Link href="/blog">
            <Button variant="outline" size="default" className="mt-4 md:mt-0 group">
              Lihat Semua Artikel
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all group dark:bg-gray-900 dark:border-gray-800"
            >
              <Link href={`/blog/${post.slug}`} className="block relative aspect-[3/2] overflow-hidden">
                <img
                  src={post.coverImage ?? "/placeholder-blog.png"}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {post.category && <Badge className="absolute top-3 left-3">{post.category}</Badge>}
              </Link>
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3 dark:text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {formatDate(post.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {Math.max(1, Math.round((post.content?.length ?? 0) / 1000))} min
                  </span>
                </div>
                <Link href={`/blog/${post.slug}`}>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors dark:text-gray-100">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500 line-clamp-2 dark:text-gray-400">{post.excerpt}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
