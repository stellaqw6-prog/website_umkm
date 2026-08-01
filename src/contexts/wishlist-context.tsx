"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useSession } from "@/hooks/use-session";
import toast from "react-hot-toast";

interface WishlistContextValue {
  productIds: Set<number>;
  loading: boolean;
  toggle: (productId: number) => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const [productIds, setProductIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProductIds(new Set());
      setLoading(false);
      return;
    }
    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) => setProductIds(new Set((data.items ?? []).map((i: { id: number }) => i.id))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const toggle = useCallback(
    async (productId: number) => {
      if (!user) {
        toast.error("Login dulu untuk simpan ke wishlist");
        return;
      }

      const isSaved = productIds.has(productId);

      if (isSaved) {
        setProductIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
        await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
        toast.success("Dihapus dari wishlist");
      } else {
        setProductIds((prev) => new Set(prev).add(productId));
        await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        toast.success("Ditambahkan ke wishlist");
      }
    },
    [user, productIds]
  );

  return <WishlistContext.Provider value={{ productIds, loading, toggle }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist harus dipakai di dalam <WishlistProvider>");
  return ctx;
}
