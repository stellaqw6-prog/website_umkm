"use client";

import { useState } from "react";
import { Bell, Search, LogOut, ShieldCheck, UserCog, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSession } from "@/hooks/use-session";
import { useDashboardSidebar } from "@/contexts/dashboard-sidebar-context";
import { AnimatePresence, motion } from "framer-motion";

export function AdminHeader() {
  const { user, logout } = useSession();
  const { toggleMobile } = useDashboardSidebar();
  const [menuOpen, setMenuOpen] = useState(false);
  const displayName = user?.name ?? "Admin";
  const isDeveloper = user?.role === "superadmin";

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between gap-2 px-3 md:px-6 dark:bg-stone-900/80 dark:border-stone-800">
      {/* Hamburger — cuma tampil di mobile/tablet, buat buka-tutup sidebar */}
      <button
        onClick={toggleMobile}
        className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all lg:hidden dark:text-stone-400 dark:hover:bg-stone-800 flex-shrink-0"
        aria-label="Buka menu"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md min-w-0">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-stone-500" />
          <Input
            placeholder="Cari produk, pesanan, pelanggan..."
            className="pl-9 h-9 text-sm bg-gray-50 border-gray-200 dark:bg-stone-800 dark:border-stone-700"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
        <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-all dark:text-stone-400 dark:hover:bg-stone-800">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
        </button>

        <div
          className="relative"
          onMouseEnter={() => setMenuOpen(true)}
          onMouseLeave={() => setMenuOpen(false)}
        >
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 p-2 rounded-xl text-gray-700 hover:bg-gray-100 transition-all dark:text-stone-300 dark:hover:bg-stone-800"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {displayName.charAt(0)}
            </div>
            <span className="hidden md:flex flex-col items-start leading-tight">
              <span className="text-sm font-medium">{displayName}</span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                  isDeveloper ? "text-indigo-600 dark:text-indigo-400" : "text-blue-600 dark:text-blue-400"
                }`}
              >
                {isDeveloper ? <ShieldCheck size={10} /> : <UserCog size={10} />}
                {isDeveloper ? "Developer" : "Admin"}
              </span>
            </span>
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute top-full right-0 mt-1 w-44 bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-200/50 py-2 z-50 dark:bg-stone-900 dark:border-stone-800 dark:shadow-black/40"
              >
                <div className="px-4 py-1.5 text-xs text-gray-400 md:hidden dark:text-stone-500">
                  {displayName} · {isDeveloper ? "Developer" : "Admin"}
                </div>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors dark:hover:bg-red-950/40"
                >
                  <LogOut size={15} /> Keluar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
