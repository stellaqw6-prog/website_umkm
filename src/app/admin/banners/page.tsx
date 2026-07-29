import { Metadata } from "next";
import { AdminBanners } from "@/components/admin/admin-banners";

export const metadata: Metadata = { title: "Banner" };

export default function AdminBannersPage() {
  return <AdminBanners />;
}
