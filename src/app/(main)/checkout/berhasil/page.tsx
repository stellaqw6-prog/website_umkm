import { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutSuccessPage } from "@/components/checkout/checkout-success-page";

export const metadata: Metadata = { title: "Pesanan Berhasil" };

export default function CheckoutBerhasilPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutSuccessPage />
    </Suspense>
  );
}
