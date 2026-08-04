"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SellerUpgradeContextValue {
  isOpen: boolean;
  openSellerUpgrade: () => void;
  closeSellerUpgrade: () => void;
}

const SellerUpgradeContext = createContext<SellerUpgradeContextValue | undefined>(undefined);

export function SellerUpgradeProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SellerUpgradeContext.Provider
      value={{
        isOpen,
        openSellerUpgrade: () => setIsOpen(true),
        closeSellerUpgrade: () => setIsOpen(false),
      }}
    >
      {children}
    </SellerUpgradeContext.Provider>
  );
}

export function useSellerUpgrade() {
  const ctx = useContext(SellerUpgradeContext);
  if (!ctx) {
    throw new Error("useSellerUpgrade harus dipakai di dalam SellerUpgradeProvider");
  }
  return ctx;
}
