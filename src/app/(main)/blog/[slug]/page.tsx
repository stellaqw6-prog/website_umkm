import { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { blogPosts } from "@/db/schema";
import { getBlogPostBySlug } from "@/lib/data";
import { BlogDetail } from "@/components/blog/blog-detail";

export const revalidate = 0;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Artikel Tidak Ditemukan" };
  return { title: post.title, description: post.excerpt ?? undefined };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post || !post.isPublished) {
    notFound();
  }

  db.update(blogPosts).set({ viewCount: sql`${blogPosts.viewCount} + 1` }).where(eq(blogPosts.id, post.id)).then();

  return <BlogDetail post={post} />;
}
