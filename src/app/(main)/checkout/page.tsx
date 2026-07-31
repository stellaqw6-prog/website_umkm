import { Metadata } from "next";
import { CheckoutPage } from "@/components/checkout/checkout-page";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutRoutePage() {
  return <CheckoutPage />;
}
