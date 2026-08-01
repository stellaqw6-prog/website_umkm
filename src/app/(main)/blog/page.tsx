import { Metadata } from "next";
import { BlogListPage } from "@/components/blog/blog-list-page";
import { getPublishedBlogPosts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Blog",
  description: "Baca artikel terbaru seputar UMKM, tips bisnis, inspirasi, dan berita terkini dari UMKM Store.",
};

export const revalidate = 0;

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts(50);
  return <BlogListPage posts={posts} />;
}
