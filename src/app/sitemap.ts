import { MetadataRoute } from "next";
import { db } from "@/db";
import { products, blogPosts } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/produk`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/blog`, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/promo`, changeFrequency: "daily", priority: 0.7 },
    { url: `${baseUrl}/tentang-kami`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/kontak`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/faq`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const activeProducts = await db.select({ slug: products.slug, updatedAt: products.updatedAt }).from(products).where(eq(products.isActive, true));
  const productPages: MetadataRoute.Sitemap = activeProducts.map((p) => ({
    url: `${baseUrl}/produk/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const publishedPosts = await db.select({ slug: blogPosts.slug, updatedAt: blogPosts.updatedAt }).from(blogPosts).where(eq(blogPosts.isPublished, true));
  const blogPages: MetadataRoute.Sitemap = publishedPosts.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...blogPages];
}
