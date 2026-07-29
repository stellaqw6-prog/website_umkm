import { Metadata } from "next";
import { AdminPromotions } from "@/components/admin/admin-promotions";

export const metadata: Metadata = { title: "Promo" };

export default function AdminPromotionsPage() {
  return <AdminPromotions />;
}
