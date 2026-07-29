import { Metadata } from "next";
import { BlogListPage } from "@/components/blog/blog-list-page";

export const metadata: Metadata = {
  title: "Blog",
  description: "Baca artikel terbaru seputar UMKM, tips bisnis, inspirasi, dan berita terkini dari UMKM Store.",
};

export default function BlogPage() {
  return <BlogListPage />;
}
