import { Metadata } from "next";
import { SellerSettings } from "@/components/seller/seller-settings";

export const metadata: Metadata = { title: "Profil Toko" };

export default function SellerSettingsPage() {
  return <SellerSettings />;
}
