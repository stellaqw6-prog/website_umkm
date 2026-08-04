"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "@/hooks/use-session";
import { useDashboardSidebar } from "@/contexts/dashboard-sidebar-context";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  FileText,
  Tag,
  Megaphone,
  Settings,
  BarChart3,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Star,
  LogOut,
  HelpCircle,
  Wallet,
  ShieldCheck,
  UserCog,
  X,
} from "lucide-react";
import { useState } from "react";

const menuGroups = [
  {
    label: "Utama",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Analitik", href: "/admin/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Manajemen",
    items: [
      { label: "Produk", href: "/admin/products", icon: Package },
      { label: "Pesanan", href: "/admin/orders", icon: ShoppingBag },
      { label: "Pelanggan", href: "/admin/customers", icon: Users },
      { label: "Kategori", href: "/admin/categories", icon: Tag },
    ],
  },
  {
    label: "Konten",
    items: [
      { label: "Blog", href: "/admin/blog", icon: FileText },
      { label: "Testimoni", href: "/admin/testimonials", icon: Star },
      { label: "FAQ", href: "/admin/faq", icon: HelpCircle },
      { label: "Pesan", href: "/admin/messages", icon: MessageSquare },
    ],
  },
  {
    label: "Marketing",
    items: [
      { label: "Promo", href: "/admin/promotions", icon: Megaphone },
      { label: "Banner", href: "/admin/banners", icon: Megaphone },
    ],
  },
  {
    label: "Sistem",
    items: [
      { label: "Pembayaran", href: "/admin/payment-methods", icon: Wallet },
      { label: "Pengaturan", href: "/admin/settings", icon: Settings },
    ],
  },
  {
    label: "Developer",
    developerOnly: true,
    items: [
      { label: "Verifikasi Seller", href: "/admin/seller-requests", icon: ShieldCheck },
      { label: "Kelola Role User", href: "/admin/users", icon: UserCog },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useSession();
  const { mobileOpen, closeMobile } = useDashboardSidebar();
  const isDeveloper = user?.role === "superadmin";

  const visibleGroups = menuGroups.filter((group) => !group.developerOnly || isDeveloper);

  return (
    <>
      {/* Mobile backdrop — cuma muncul & bisa diklik-tutup saat sidebar mobile lagi kebuka */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300 flex flex-col transform dark:bg-gray-900 dark:border-gray-800",
          collapsed ? "lg:w-20" : "lg:w-64",
          "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 dark:border-gray-800">
          <Link
            href="/admin/dashboard"
            onClick={closeMobile}
            className={cn("flex items-center gap-2 overflow-hidden", collapsed && "lg:justify-center")}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0">
              U
            </div>
            <span className={cn("font-bold text-gray-900 text-sm dark:text-gray-100", collapsed && "lg:hidden")}>
              UMKM<span className="text-blue-600 dark:text-blue-400">{isDeveloper ? "Developer" : "Admin"}</span>
            </span>
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors hidden lg:block dark:hover:bg-gray-800 dark:text-gray-500"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            onClick={closeMobile}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors lg:hidden dark:hover:bg-gray-800 dark:text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Role badge — biar jelas beda antara Developer asli dan Admin biasa */}
        {user && (
          <div className={cn("px-4 pt-3", collapsed && "lg:hidden")}>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold",
                isDeveloper
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300"
                  : "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
              )}
            >
              {isDeveloper ? <ShieldCheck size={12} /> : <UserCog size={12} />}
              {isDeveloper ? "Developer" : "Admin"}
            </span>
          </div>
        )}

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {visibleGroups.map((group) => (
            <div key={group.label}>
              <p className={cn("px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider dark:text-gray-500", collapsed && "lg:hidden")}>
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobile}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                        collapsed && "lg:justify-center lg:px-2"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon size={20} className={cn(isActive && "text-blue-600 dark:text-blue-400")} />
                      <span className={cn(collapsed && "lg:hidden")}>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-100 p-3 dark:border-gray-800">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all dark:text-gray-400 dark:hover:bg-gray-800",
              collapsed && "lg:justify-center lg:px-2"
            )}
          >
            <LogOut size={20} />
            <span className={cn(collapsed && "lg:hidden")}>Ke Website</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
