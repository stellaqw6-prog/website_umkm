"use client";

import { useState } from "react";
import Link from "next/link";
import { useScroll } from "@/hooks/use-scroll";
import { useMobile } from "@/hooks/use-mobile";
import { useSession } from "@/hooks/use-session";
import { useCart } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Beranda", href: "/" },
  {
    label: "Produk",
    href: "/produk",
    children: [
      { label: "Semua Produk", href: "/produk" },
      { label: "Best Seller", href: "/produk?sort=best-seller" },
      { label: "Produk Terbaru", href: "/produk?sort=terbaru" },
      { label: "Promo", href: "/promo" },
      { label: "Flash Sale", href: "/flash-sale" },
    ],
  },
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Blog", href: "/blog" },
  { label: "Kontak", href: "/kontak" },
];

export function Header() {
  const scrolled = useScroll(10);
  const isMobile = useMobile();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useSession();
  const { totalItems: cartCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [wishlistCount] = useState(0);

  return (
    <>
      {/* Top Bar */}
      <div className="hidden md:block bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-1.5 text-xs font-medium">
          <p>🚀 Gratis Ongkir untuk pembelian di atas Rp 200.000!</p>
          <div className="flex items-center gap-4">
            <a href="tel:+6281234567890" className="hover:underline">
              📞 +62 812-3456-7890
            </a>
            <a href="mailto:info@umkmstore.id" className="hover:underline">
              ✉️ info@umkmstore.id
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm"
            : "bg-white border-b border-transparent"
        )}
      >
        <div className="container mx-auto flex items-center justify-between px-4 h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-extrabold shadow-lg shadow-blue-500/25">
              U
            </div>
            <span className="hidden sm:block">
              <span className="text-gray-900">UMKM</span>
              <span className="text-blue-600">Store</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <DropdownMenu key={link.label} label={link.label}>
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 rounded-lg transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </DropdownMenu>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-lg hover:bg-gray-50 transition-all"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all"
            >
              <Heart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all"
            >
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
              <div
                className="relative hidden sm:block"
                onMouseEnter={() => setUserMenuOpen(true)}
                onMouseLeave={() => setUserMenuOpen(false)}
              >
                <button className="flex items-center gap-2 p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium max-w-[100px] truncate">{user.name}</span>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute top-full right-0 mt-1 w-48 bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-200/50 py-2 z-50"
                    >
                      {(user.role === "admin" || user.role === "superadmin") && (
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                        >
                          <LayoutDashboard size={15} /> Dashboard Admin
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={15} /> Keluar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="hidden sm:flex items-center gap-2 p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all"
              >
                <User size={20} />
                <span className="text-sm font-medium">Masuk</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Search Bar Expand */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-100 bg-white overflow-hidden"
            >
              <div className="container mx-auto px-4 py-3">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Cari produk, kategori, atau artikel..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm transition-all"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden border-t border-gray-100 bg-white"
            >
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-xl transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
                <hr className="my-2" />
                {user ? (
                  <>
                    {(user.role === "admin" || user.role === "superadmin") && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-all"
                      >
                        Dashboard Admin
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        logout();
                      }}
                      className="text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    >
                      Keluar ({user.name})
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    Masuk / Daftar
                  </Link>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

function DropdownMenu({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-lg hover:bg-gray-50 transition-all">
        {label}
        <ChevronDown size={14} className={open ? "rotate-180 transition-transform" : "transition-transform"} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl border border-gray-100 shadow-xl shadow-gray-200/50 py-2 z-50"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
