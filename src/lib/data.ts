import { and, desc, eq, gte, ilike, lte, SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  products,
  categories,
  testimonials,
  faqs,
  blogPosts,
  banners,
} from "@/db/schema";

export interface ProductCardData {
  id: number;
  slug: string;
  name: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isBestSeller: boolean;
  discount: number;
  stock: number;
  categoryId: number | null;
}

function toProductCard(p: typeof products.$inferSelect): ProductCardData {
  const price = Number(p.price);
  const compareAtPrice = p.compareAtPrice ? Number(p.compareAtPrice) : null;
  const discount =
    compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : 0;
  const isNew = p.createdAt ? Date.now() - new Date(p.createdAt).getTime() < 1000 * 60 * 60 * 24 * 30 : false;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price,
    compareAtPrice,
    image: p.images?.[0] ?? "/placeholder-product.png",
    rating: Number(p.rating),
    reviewCount: p.reviewCount,
    isNew,
    isBestSeller: p.isBestSeller,
    discount,
    stock: p.stock,
    categoryId: p.categoryId,
  };
}

export interface ProductFilters {
  search?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: "terbaru" | "terpopuler" | "harga-terendah" | "harga-tertinggi" | "rating-tertinggi";
  page?: number;
  pageSize?: number;
}

export async function getProducts(filters: ProductFilters = {}) {
  const { search, categorySlug, minPrice, maxPrice, minRating, sort = "terbaru", page = 1, pageSize = 12 } = filters;

  const conditions: SQL[] = [eq(products.isActive, true)];

  if (search) conditions.push(ilike(products.name, `%${search}%`));
  if (minPrice !== undefined) conditions.push(gte(products.price, String(minPrice)));
  if (maxPrice !== undefined) conditions.push(lte(products.price, String(maxPrice)));
  if (minRating !== undefined) conditions.push(gte(products.rating, String(minRating)));

  let categoryId: number | undefined;
  if (categorySlug && categorySlug !== "semua") {
    const [cat] = await db.select().from(categories).where(eq(categories.slug, categorySlug)).limit(1);
    if (cat) {
      categoryId = cat.id;
      conditions.push(eq(products.categoryId, cat.id));
    }
  }

  const orderBy = {
    terbaru: desc(products.createdAt),
    terpopuler: desc(products.reviewCount),
    "harga-terendah": products.price,
    "harga-tertinggi": desc(products.price),
    "rating-tertinggi": desc(products.rating),
  }[sort];

  const rows = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  return rows.map(toProductCard);
}

export async function getFeaturedProducts(limit = 8) {
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.isFeatured, true)))
    .orderBy(desc(products.createdAt))
    .limit(limit);
  return rows.map(toProductCard);
}

export async function getProductBySlug(slug: string) {
  const [row] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!row) return null;

  let categoryName: string | null = null;
  if (row.categoryId) {
    const [cat] = await db.select().from(categories).where(eq(categories.id, row.categoryId)).limit(1);
    categoryName = cat?.name ?? null;
  }

  return { ...toProductCard(row), description: row.description, categoryName, images: row.images };
}

export async function getRelatedProducts(categoryId: number | null, excludeId: number, limit = 4) {
  if (!categoryId) return [];
  const rows = await db
    .select()
    .from(products)
    .where(and(eq(products.isActive, true), eq(products.categoryId, categoryId)))
    .limit(limit + 1);
  return rows.filter((r) => r.id !== excludeId).slice(0, limit).map(toProductCard);
}

export async function getCategories() {
  return db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder);
}

export async function getTestimonials(limit = 6) {
  return db.select().from(testimonials).where(eq(testimonials.isActive, true)).limit(limit);
}

export async function getFaqs() {
  return db.select().from(faqs).where(eq(faqs.isActive, true)).orderBy(faqs.sortOrder);
}

export async function getPublishedBlogPosts(limit = 3) {
  return db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.isPublished, true))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);
}

export async function getBlogPostBySlug(slug: string) {
  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1);
  return row ?? null;
}

export async function getActiveBanners() {
  return db.select().from(banners).where(eq(banners.isActive, true)).orderBy(banners.sortOrder);
}
