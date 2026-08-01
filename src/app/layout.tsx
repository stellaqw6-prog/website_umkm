import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { CartProvider } from "@/contexts/cart-context";
import { WishlistProvider } from "@/contexts/wishlist-context";
import { getSiteSettings } from "@/lib/data";
import "./globals.css";

// Pastikan title/deskripsi selalu ambil data pengaturan terbaru dari database,
// bukan hasil cache statis saat build.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings().catch(() => null);
  const siteName = settings?.siteName || "UMKM Store";
  const description =
    settings?.siteDescription ||
    "Platform UMKM terpercaya yang menyediakan produk-produk berkualitas dari pengusaha lokal Indonesia. Dukung UMKM Indonesia!";

  return {
    title: {
      default: `${siteName} - Produk UMKM Berkualitas Indonesia`,
      template: `%s | ${siteName}`,
    },
    description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
    keywords: [
      "UMKM",
      "produk lokal",
      "Indonesia",
      siteName,
      "belanja online",
      "produk UMKM",
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName,
      title: `${siteName} - Produk UMKM Berkualitas Indonesia`,
      description,
      images: settings?.logo ? [{ url: settings.logo, width: 1200, height: 630 }] : [{ url: "/images/og-image.jpg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} - Produk UMKM Berkualitas Indonesia`,
      description,
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
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings().catch(() => null);
  const siteName = settings?.siteName || "UMKM Store";

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content={settings?.primaryColor || "#2563eb"} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: siteName,
              url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
              logo: settings?.logo || "/images/logo.png",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: settings?.phone || "+62-812-3456-7890",
                contactType: "customer service",
                areaServed: "ID",
                availableLanguage: "Indonesian",
              },
              sameAs: [settings?.facebook, settings?.instagram, settings?.tiktok, settings?.youtube].filter(Boolean),
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
