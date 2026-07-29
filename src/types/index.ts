export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  sku: string;
  stock: number;
  categoryId: number;
  images: string[];
  videoUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isTrending: boolean;
  rating: number;
  reviewCount: number;
  weight: number;
  dimensions: string | null;
  specifications: Record<string, string> | null;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: number | null;
  isActive: boolean;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  children?: Category[];
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  role: "customer" | "admin" | "superadmin";
  membership: "regular" | "silver" | "gold" | "platinum";
  points: number;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: number;
  userId: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  shippingCost: number;
  discountAmount: number;
  grandTotal: number;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  trackingNumber: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus =
  | "unpaid"
  | "paid"
  | "expired"
  | "refunded";

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorId: number;
  category: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Testimonial {
  id: number;
  name: string;
  avatar: string | null;
  rating: number;
  content: string;
  role: string | null;
  productId: number | null;
  isActive: boolean;
  createdAt: Date;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  isActive: boolean;
  sortOrder: number;
  startDate: Date | null;
  endDate: Date | null;
}

export interface Promotion {
  id: number;
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  minPurchase: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  description: string | null;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  content: string;
  images: string[] | null;
  isActive: boolean;
  createdAt: Date;
  user?: User;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export interface SiteSettings {
  id: number;
  siteName: string;
  siteDescription: string;
  logo: string | null;
  favicon: string | null;
  primaryColor: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  whatsapp: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  twitter: string | null;
  googleMaps: string | null;
  gaTrackingId: string | null;
  metaPixelId: string | null;
  tiktokPixelId: string | null;
}
