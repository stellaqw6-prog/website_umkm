import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { CartProvider } from "@/contexts/cart-context";
import { WishlistProvider } from "@/contexts/wishlist-context";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "UMKM Store - Produk UMKM Berkualitas Indonesia",
    template: "%s | UMKM Store",
  },
  description:
    "Platform UMKM terpercaya yang menyediakan produk-produk berkualitas dari pengusaha lokal Indonesia. Dukung UMKM Indonesia!",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://umkmstore.id"),
  keywords: [
    "UMKM",
    "produk lokal",
    "Indonesia",
    "UMKM Store",
    "belanja online",
    "produk UMKM",
  ],
  authors: [{ name: "UMKM Store" }],
  creator: "UMKM Store",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "UMKM Store",
    title: "UMKM Store - Produk UMKM Berkualitas Indonesia",
    description:
      "Platform UMKM terpercaya yang menyediakan produk-produk berkualitas dari pengusaha lokal Indonesia.",
    images: [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "UMKM Store - Produk UMKM Berkualitas Indonesia",
    description:
      "Platform UMKM terpercaya yang menyediakan produk-produk berkualitas dari pengusaha lokal Indonesia.",
    images: ["/images/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2563eb" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "UMKM Store",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://umkmstore.id",
              logo: "/images/logo.png",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+62-812-3456-7890",
                contactType: "customer service",
                areaServed: "ID",
                availableLanguage: "Indonesian",
              },
              sameAs: [
                "https://facebook.com/umkmstore",
                "https://instagram.com/umkmstore",
                "https://tiktok.com/@umkmstore",
                "https://youtube.com/@umkmstore",
              ],
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <ThemeProvider>
          <ToastProvider />
          <CartProvider>
            <WishlistProvider>{children}</WishlistProvider>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
