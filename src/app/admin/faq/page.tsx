import { Metadata } from "next";
import { AdminFaq } from "@/components/admin/admin-faq";

export const metadata: Metadata = { title: "FAQ" };

export default function AdminFaqPage() {
  return <AdminFaq />;
}
