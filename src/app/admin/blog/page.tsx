import { Metadata } from "next";
import { AdminBlog } from "@/components/admin/admin-blog";

export const metadata: Metadata = { title: "Blog" };

export default function AdminBlogPage() {
  return <AdminBlog />;
}
