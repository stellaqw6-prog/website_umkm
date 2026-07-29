import { Metadata } from "next";
import { AdminCustomers } from "@/components/admin/admin-customers";

export const metadata: Metadata = { title: "Pelanggan" };

export default function AdminCustomersPage() {
  return <AdminCustomers />;
}
