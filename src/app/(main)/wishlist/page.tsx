import { Metadata } from "next";
import { WishlistPage } from "@/components/wishlist/wishlist-page";

export const metadata: Metadata = {
  title: "Wishlist Saya",
};

export default function WishlistRoutePage() {
  return <WishlistPage />;
}
