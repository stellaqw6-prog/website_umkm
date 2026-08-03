import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  timestamp,
  jsonb,
  date,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// ==================== ENUMS ====================
export const userRoleEnum = pgEnum("user_role", ["customer", "seller", "admin", "superadmin"]);
export const sellerUpgradeStatusEnum = pgEnum("seller_upgrade_status", ["pending", "approved", "rejected"]);
export const membershipEnum = pgEnum("membership", ["regular", "silver", "gold", "platinum"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "unpaid",
  "paid",
  "expired",
  "refunded",
]);
export const promotionTypeEnum = pgEnum("promotion_type", [
  "percentage",
  "fixed",
  "free_shipping",
]);
export const paymentMethodTypeEnum = pgEnum("payment_method_type", ["ewallet", "bank", "cod"]);

// ==================== USERS ====================
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }),
    name: varchar("name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    avatar: text("avatar"),
    role: userRoleEnum("role").default("customer").notNull(),
    membership: membershipEnum("membership").default("regular").notNull(),
    points: integer("points").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("users_email_idx").on(table.email)]
);

// ==================== CATEGORIES ====================
export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    image: text("image"),
    parentId: integer("parent_id"),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: text("seo_description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("categories_slug_idx").on(table.slug)]
);

// ==================== PRODUCTS ====================
export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 500 }).notNull().unique(),
    description: text("description"),
    price: decimal("price", { precision: 12, scale: 2 }).notNull(),
    compareAtPrice: decimal("compare_at_price", { precision: 12, scale: 2 }),
    sku: varchar("sku", { length: 100 }),
    stock: integer("stock").default(0).notNull(),
    categoryId: integer("category_id").references(() => categories.id),
    sellerId: integer("seller_id").references(() => users.id), // null = produk milik platform/admin
    images: jsonb("images").$type<string[]>().default([]).notNull(),
    videoUrl: text("video_url"),
    isActive: boolean("is_active").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    isBestSeller: boolean("is_best_seller").default(false).notNull(),
    isTrending: boolean("is_trending").default(false).notNull(),
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0").notNull(),
    reviewCount: integer("review_count").default(0).notNull(),
    weight: integer("weight").default(0).notNull(),
    dimensions: varchar("dimensions", { length: 100 }),
    specifications: jsonb("specifications").$type<Record<string, string>>(),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: text("seo_description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("products_slug_idx").on(table.slug),
    index("products_category_idx").on(table.categoryId),
    index("products_featured_idx").on(table.isFeatured),
    index("products_seller_idx").on(table.sellerId),
  ]
);

// ==================== PRODUCT VARIANTS ====================
// Satu produk/menu bisa punya banyak varian (contoh: Warna, Ukuran, Rasa, dll).
// Kalau produk tidak punya varian sama sekali, produk tetap bisa dijual langsung
// pakai harga & stok dari tabel products seperti biasa.
export const productVariants = pgTable(
  "product_variants",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 255 }).notNull(), // contoh: "Merah - Ukuran L"
    price: decimal("price", { precision: 12, scale: 2 }), // null = pakai harga produk utama
    stock: integer("stock").default(0).notNull(),
    sku: varchar("sku", { length: 100 }),
    image: text("image"), // opsional, gambar khusus varian ini
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("product_variants_product_idx").on(table.productId)]
);

// ==================== ORDERS ====================
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    sellerId: integer("seller_id").references(() => users.id), // null = pesanan produk platform/admin
    checkoutGroupId: varchar("checkout_group_id", { length: 100 }), // menandai beberapa order yang lahir dari 1x checkout (beda seller)
    orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
    status: orderStatusEnum("status").default("pending").notNull(),
    totalAmount: decimal("total_amount", { precision: 12, scale: 2 }).notNull(),
    shippingCost: decimal("shipping_cost", { precision: 12, scale: 2 }).default("0").notNull(),
    discountAmount: decimal("discount_amount", { precision: 12, scale: 2 }).default("0").notNull(),
    grandTotal: decimal("grand_total", { precision: 12, scale: 2 }).notNull(),
    shippingAddress: text("shipping_address").notNull(),
    paymentMethod: varchar("payment_method", { length: 100 }),
    paymentStatus: paymentStatusEnum("payment_status").default("unpaid").notNull(),
    paymentProofUrl: text("payment_proof_url"),
    paymentProofUploadedAt: timestamp("payment_proof_uploaded_at"),
    trackingNumber: varchar("tracking_number", { length: 100 }),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("orders_user_idx").on(table.userId),
    index("orders_number_idx").on(table.orderNumber),
    index("orders_seller_idx").on(table.sellerId),
  ]
);

// ==================== ORDER ITEMS ====================
export const orderItems = pgTable(
  "order_items",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    productId: integer("product_id")
      .references(() => products.id)
      .notNull(),
    productName: varchar("product_name", { length: 500 }).notNull(),
    productImage: text("product_image"),
    variantId: integer("variant_id").references(() => productVariants.id),
    variantName: varchar("variant_name", { length: 255 }), // snapshot nama varian saat dipesan
    price: decimal("price", { precision: 12, scale: 2 }).notNull(),
    quantity: integer("quantity").notNull(),
    subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)]
);

// ==================== REVIEWS ====================
export const reviews = pgTable(
  "reviews",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    userId: integer("user_id")
      .references(() => users.id)
      .notNull(),
    rating: integer("rating").notNull(),
    content: text("content").notNull(),
    images: jsonb("images").$type<string[]>(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("reviews_product_idx").on(table.productId)]
);

// ==================== BLOG POSTS ====================
export const blogPosts = pgTable(
  "blog_posts",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    slug: varchar("slug", { length: 500 }).notNull().unique(),
    excerpt: text("excerpt"),
    content: text("content").notNull(),
    coverImage: text("cover_image"),
    authorId: integer("author_id").references(() => users.id),
    category: varchar("category", { length: 255 }),
    tags: jsonb("tags").$type<string[]>().default([]).notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    viewCount: integer("view_count").default(0).notNull(),
    seoTitle: varchar("seo_title", { length: 255 }),
    seoDescription: text("seo_description"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("blog_slug_idx").on(table.slug)]
);

// ==================== TESTIMONIALS ====================
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  avatar: text("avatar"),
  rating: integer("rating").default(5).notNull(),
  content: text("content").notNull(),
  role: varchar("role", { length: 255 }),
  productId: integer("product_id").references(() => products.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== FAQS ====================
export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 255 }),
  sortOrder: integer("sort_order").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

// ==================== BANNERS ====================
export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 500 }),
  image: text("image").notNull(),
  link: text("link"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== PROMOTIONS ====================
export const promotions = pgTable(
  "promotions",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    type: promotionTypeEnum("type").notNull(),
    value: decimal("value", { precision: 12, scale: 2 }).notNull(),
    minPurchase: decimal("min_purchase", { precision: 12, scale: 2 }),
    maxDiscount: decimal("max_discount", { precision: 12, scale: 2 }),
    usageLimit: integer("usage_limit"),
    usedCount: integer("used_count").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("promotions_code_idx").on(table.code)]
);

// ==================== CONTACT MESSAGES ====================
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  subject: varchar("subject", { length: 500 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== SITE SETTINGS ====================
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  siteName: varchar("site_name", { length: 255 }).default("UMKM Store").notNull(),
  siteDescription: text("site_description"),
  logo: text("logo"),
  favicon: text("favicon"),
  primaryColor: varchar("primary_color", { length: 7 }).default("#2563eb").notNull(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  whatsapp: varchar("whatsapp", { length: 50 }),
  facebook: text("facebook"),
  instagram: text("instagram"),
  tiktok: text("tiktok"),
  youtube: text("youtube"),
  twitter: text("twitter"),
  googleMaps: text("google_maps"),
  gaTrackingId: varchar("ga_tracking_id", { length: 50 }),
  metaPixelId: varchar("meta_pixel_id", { length: 50 }),
  tiktokPixelId: varchar("tiktok_pixel_id", { length: 50 }),
  sellerUpgradeFee: decimal("seller_upgrade_fee", { precision: 12, scale: 2 }).default("100000").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== NEWSLETTER SUBSCRIBERS ====================
export const subscribers = pgTable(
  "subscribers",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("subscribers_email_idx").on(table.email)]
);

// ==================== VISITOR LOGS ====================
export const visitorLogs = pgTable("visitor_logs", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  page: varchar("page", { length: 500 }),
  referrer: text("referrer"),
  device: varchar("device", { length: 50 }),
  browser: varchar("browser", { length: 100 }),
  country: varchar("country", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== WISHLIST ====================
export const wishlists = pgTable(
  "wishlists",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("wishlists_user_product_idx").on(table.userId, table.productId)]
);

// ==================== PAYMENT METHODS ====================
export const paymentMethods = pgTable(
  "payment_methods",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(), // contoh: "DANA", "GoPay", "OVO", "Bank BCA"
    type: paymentMethodTypeEnum("type").notNull(), // ewallet | bank
    provider: varchar("provider", { length: 50 }).notNull(), // dana | gopay | ovo | bca | qris | cod | mandiri | bri | bni | dst
    accountNumber: varchar("account_number", { length: 100 }).default("-").notNull(), // nomor HP (e-wallet) atau nomor rekening (bank); "-" untuk COD
    accountName: varchar("account_name", { length: 255 }).default("-").notNull(), // nama pemilik akun/rekening; "-" untuk COD
    qrImage: text("qr_image"), // URL gambar QR code (opsional)
    instructions: text("instructions"), // instruksi tambahan (opsional)
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("payment_methods_active_idx").on(table.isActive)]
);

// ==================== PASSWORD RESET TOKENS ====================
export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    used: boolean("used").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("password_reset_tokens_token_idx").on(table.token)]
);

// ==================== STORES (TOKO SELLER) ====================
export const stores = pgTable(
  "stores",
  {
    id: serial("id").primaryKey(),
    sellerId: integer("seller_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    logo: text("logo"),
    banner: text("banner"),
    phone: varchar("phone", { length: 50 }),
    address: text("address"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("stores_seller_idx").on(table.sellerId), index("stores_slug_idx").on(table.slug)]
);

// ==================== SELLER UPGRADE REQUESTS ====================
export const sellerUpgradeRequests = pgTable(
  "seller_upgrade_requests",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    storeName: varchar("store_name", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    paymentMethod: varchar("payment_method", { length: 100 }),
    paymentProofUrl: text("payment_proof_url"),
    status: sellerUpgradeStatusEnum("status").default("pending").notNull(),
    reviewedBy: integer("reviewed_by").references(() => users.id),
    reviewedAt: timestamp("reviewed_at"),
    rejectionReason: text("rejection_reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("seller_upgrade_requests_user_idx").on(table.userId), index("seller_upgrade_requests_status_idx").on(table.status)]
);
