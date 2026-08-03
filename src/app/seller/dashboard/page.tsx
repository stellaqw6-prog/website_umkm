import { Metadata } from "next";
import { SellerDashboard } from "@/components/seller/seller-dashboard";

export const metadata: Metadata = { title: "Dashboard" };

export default function SellerDashboardPage() {
  return <SellerDashboard />;
}
