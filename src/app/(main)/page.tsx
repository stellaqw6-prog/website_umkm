import { HeroSection } from "@/components/home/hero-section";
import { CategorySection } from "@/components/home/category-section";
import { FeaturedProducts } from "@/components/home/featured-products";
import { StatsSection } from "@/components/home/stats-section";
import { TestimonialSection } from "@/components/home/testimonial-section";
import { BlogSection } from "@/components/home/blog-section";
import { FaqSection } from "@/components/home/faq-section";
import { CtaSection } from "@/components/home/cta-section";
import {
  getFeaturedProducts,
  getCategories,
  getTestimonials,
  getFaqs,
  getPublishedBlogPosts,
  getPlatformStats,
} from "@/lib/data";

// Ambil data terbaru setiap request supaya perubahan dari admin langsung terlihat
export const revalidate = 0;

export default async function HomePage() {
  const [featuredProducts, categories, testimonials, faqs, blogPosts, stats] = await Promise.all([
    getFeaturedProducts(8),
    getCategories(),
    getTestimonials(6),
    getFaqs(),
    getPublishedBlogPosts(3),
    getPlatformStats(),
  ]);

  return (
    <>
      <HeroSection />
      <CategorySection categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <StatsSection stats={stats} />
      <TestimonialSection testimonials={testimonials} />
      <BlogSection posts={blogPosts} />
      <FaqSection faqs={faqs} />
      <CtaSection />
    </>
  );
}
