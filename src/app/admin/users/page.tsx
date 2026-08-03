import { Metadata } from "next";
import { AdminUsers } from "@/components/admin/admin-users";

export const metadata: Metadata = { title: "Kelola Role User" };

export default function AdminUsersPage() {
  return <AdminUsers />;
}
