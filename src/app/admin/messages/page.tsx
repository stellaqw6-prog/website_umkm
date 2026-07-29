import { Metadata } from "next";
import { AdminMessages } from "@/components/admin/admin-messages";

export const metadata: Metadata = { title: "Pesan" };

export default function AdminMessagesPage() {
  return <AdminMessages />;
}
