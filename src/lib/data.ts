import { and, desc, eq, gte, ilike, lte, SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  products,
  categories,
  testimonials,
  faqs,
  blogPosts,
  banners,
  siteSettings,
  promotions,
  paymentMethods,
  productVariants,
  stores,
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

export async function getProductVariants(productId: number) {
  const rows = await db
    .select()
    .from(productVariants)
    .where(and(eq(productVariants.productId, productId), eq(productVariants.isActive, true)))
    .orderBy(productVariants.sortOrder);
  return rows.map((v) => ({
    id: v.id,
    productId: v.productId,
    name: v.name,
    price: v.price ? Number(v.price) : null,
    stock: v.stock,
    sku: v.sku,
    image: v.image,
  }));
}

export async function getProductBySlug(slug: string) {
  const [row] = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  if (!row) return null;

  let categoryName: string | null = null;
  if (row.categoryId) {
    const [cat] = await db.select().from(categories).where(eq(categories.id, row.categoryId)).limit(1);
    categoryName = cat?.name ?? null;
  }

  let storeName: string | null = null;
  let storeSlug: string | null = null;
  if (row.sellerId) {
    const [store] = await db.select().from(stores).where(eq(stores.sellerId, row.sellerId)).limit(1);
    storeName = store?.name ?? null;
    storeSlug = store?.slug ?? null;
  }

  const variants = await getProductVariants(row.id);

  return { ...toProductCard(row), description: row.description, categoryName, images: row.images, variants, storeName, storeSlug };
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

export async function getSiteSettings() {
  const existing = await db.select().from(siteSettings).limit(1);
  if (existing.length > 0) return existing[0];

  const [created] = await db.insert(siteSettings).values({}).returning();
  return created;
}

// Data awal metode pembayaran — otomatis dibuat sekali saat tabel masih kosong,
// setelah itu semua diatur lewat Dashboard Admin > Pembayaran.
const defaultPaymentMethods = [
  {
    name: "DANA",
    type: "ewallet" as const,
    provider: "dana",
    accountNumber: "082326153257",
    accountName: "M Fuad Akbar Firmansyah",
    sortOrder: 0,
  },
  {
    name: "GoPay",
    type: "ewallet" as const,
    provider: "gopay",
    accountNumber: "082326153257",
    accountName: "M Fuad Akbar Firmansyah",
    sortOrder: 1,
  },
  {
    name: "Bank BCA",
    type: "bank" as const,
    provider: "bca",
    accountNumber: "0392258076",
    accountName: "M Fuad Akbar Firmansyah",
    sortOrder: 2,
  },
  {
    name: "QRIS",
    type: "ewallet" as const,
    provider: "qris",
    accountNumber: "-",
    accountName: "M Fuad Akbar Firmansyah",
    instructions: "Scan kode QR menggunakan aplikasi e-wallet atau m-banking apa saja yang mendukung QRIS.",
    sortOrder: 3,
  },
  {
    name: "Bayar di Tempat (COD)",
    type: "cod" as const,
    provider: "cod",
    accountNumber: "-",
    accountName: "-",
    instructions: "Bayar tunai langsung kepada kurir saat pesanan tiba di alamat Anda.",
    sortOrder: 4,
  },
];

export async function getAllPaymentMethods() {
  const existing = await db.select().from(paymentMethods).orderBy(paymentMethods.sortOrder);
  if (existing.length > 0) return existing;

  await db.insert(paymentMethods).values(defaultPaymentMethods);
  return db.select().from(paymentMethods).orderBy(paymentMethods.sortOrder);
}

export async function getActivePaymentMethods() {
  const all = await getAllPaymentMethods();
  return all.filter((m) => m.isActive);
}

export async function getActivePromotions() {
  const now = new Date();
  const rows = await db.select().from(promotions).where(eq(promotions.isActive, true));
  return rows.filter((p) => now >= new Date(p.startDate) && now <= new Date(p.endDate) && (!p.usageLimit || p.usedCount < p.usageLimit));
}
