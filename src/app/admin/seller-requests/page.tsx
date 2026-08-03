import { Metadata } from "next";
import { AdminSellerRequests } from "@/components/admin/admin-seller-requests";

export const metadata: Metadata = { title: "Verifikasi Seller" };

export default function AdminSellerRequestsPage() {
  return <AdminSellerRequests />;
}
