import { Metadata } from "next";
import { AdminCategories } from "@/components/admin/admin-categories";

export const metadata: Metadata = { title: "Kategori" };

export default function AdminCategoriesPage() {
  return <AdminCategories />;
}
