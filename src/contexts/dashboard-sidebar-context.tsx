"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface DashboardSidebarContextValue {
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;
}

const DashboardSidebarContext = createContext<DashboardSidebarContextValue | undefined>(undefined);

export function DashboardSidebarProvider({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <DashboardSidebarContext.Provider
      value={{
        mobileOpen,
        openMobile: () => setMobileOpen(true),
        closeMobile: () => setMobileOpen(false),
        toggleMobile: () => setMobileOpen((v) => !v),
      }}
    >
      {children}
    </DashboardSidebarContext.Provider>
  );
}

export function useDashboardSidebar() {
  const ctx = useContext(DashboardSidebarContext);
  if (!ctx) {
    throw new Error("useDashboardSidebar harus dipakai di dalam DashboardSidebarProvider");
  }
  return ctx;
}
