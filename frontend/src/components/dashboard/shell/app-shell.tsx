"use client";

import { AppSidebar } from "@/components/dashboard/shell/app-sidebar";
import { DashboardGuard } from "@/components/dashboard/shell/dashboard-guard";
import { MobileNav } from "@/components/dashboard/shell/mobile-nav";
import { TopBar } from "@/components/dashboard/shell/top-bar";
import { useState } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <DashboardGuard>
      <div className="flex min-h-screen bg-background">
        <div className="hidden lg:block">
          <AppSidebar className="sticky top-0 h-screen" />
        </div>

        <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar onMenuClick={() => setMobileOpen(true)} />
          <main id="main-content" className="flex-1 p-3 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </DashboardGuard>
  );
}
