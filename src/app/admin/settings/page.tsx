import { Metadata } from "next";
import { AdminSettings } from "@/components/admin/admin-settings";

export const metadata: Metadata = { title: "Pengaturan" };

export default function AdminSettingsPage() {
  return <AdminSettings />;
}
