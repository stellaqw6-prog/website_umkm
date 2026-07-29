import { Metadata } from "next";
import { AdminTestimonials } from "@/components/admin/admin-testimonials";

export const metadata: Metadata = { title: "Testimoni" };

export default function AdminTestimonialsPage() {
  return <AdminTestimonials />;
}
