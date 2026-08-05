"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, ShoppingBag, Store, ChevronLeft, ChevronRight, LogOut, X } from "lucide-react";
import { useDashboardSidebar } from "@/contexts/dashboard-sidebar-context";

const menuItems = [
  { label: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
  { label: "Produk Saya", href: "/seller/products", icon: Package },
  { label: "Pesanan Masuk", href: "/seller/orders", icon: ShoppingBag },
  { label: "Profil Toko", href: "/seller/settings", icon: Store },
];

export function SellerSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { mobileOpen, closeMobile } = useDashboardSidebar();

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={closeMobile} />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300 flex flex-col transform dark:bg-stone-900 dark:border-stone-800",
          collapsed ? "lg:w-20" : "lg:w-64",
          "w-72",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 dark:border-stone-800">
          <Link href="/seller/dashboard" onClick={closeMobile} className={cn("flex items-center gap-2 overflow-hidden", collapsed && "lg:justify-center")}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0">
              S
            </div>
            <span className={cn("font-bold text-gray-900 text-sm dark:text-stone-100", collapsed && "lg:hidden")}>
              Seller<span className="text-emerald-600 dark:text-emerald-400">Hub</span>
            </span>
          </Link>
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors hidden lg:block dark:hover:bg-stone-800 dark:text-stone-500">
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button onClick={closeMobile} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors lg:hidden dark:hover:bg-stone-800 dark:text-stone-500">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobile}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-100",
                  collapsed && "lg:justify-center lg:px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} className={cn(isActive && "text-emerald-600 dark:text-emerald-400")} />
                <span className={cn(collapsed && "lg:hidden")}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-3 dark:border-stone-800">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all dark:text-stone-400 dark:hover:bg-stone-800",
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
