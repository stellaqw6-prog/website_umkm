import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";
import { DashboardSidebarProvider } from "@/contexts/dashboard-sidebar-context";

export const metadata = {
  title: {
    default: "Dashboard | UMKM Store",
    template: "%s | Panel UMKM Store",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardSidebarProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-stone-950">
        <AdminSidebar />
        <div className="lg:pl-64">
          <AdminHeader />
          <main className="p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </DashboardSidebarProvider>
  );
}
