import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SellerUpgradeProvider } from "@/contexts/seller-upgrade-context";
import { SellerUpgradeModal } from "@/components/seller/seller-upgrade-modal";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <SellerUpgradeProvider>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      {/* Popup terpisah untuk fitur upgrade role premium (jadi seller) */}
      <SellerUpgradeModal />
    </SellerUpgradeProvider>
  );
}
