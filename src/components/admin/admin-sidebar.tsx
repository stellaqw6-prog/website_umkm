"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
} from "lucide-react";

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
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100">
          <Link
            href="/admin/dashboard"
            className={cn("flex items-center gap-2 overflow-hidden", collapsed && "justify-center")}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0">
              U
            </div>
            {!collapsed && (
              <span className="font-bold text-gray-900 text-sm">
                UMKM<span className="text-blue-600">Admin</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors hidden lg:block"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {menuGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                        isActive
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        collapsed && "justify-center px-2"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <item.icon size={20} className={cn(isActive && "text-blue-600")} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-gray-100 p-3">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all",
              collapsed && "justify-center px-2"
            )}
          >
            <LogOut size={20} />
            {!collapsed && <span>Ke Website</span>}
          </Link>
        </div>
      </aside>
    </>
  );
}
