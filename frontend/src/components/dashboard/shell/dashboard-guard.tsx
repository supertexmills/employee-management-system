"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { sessionManager } from "@/lib/auth/session-manager";
import { useAuth } from "@/providers/auth-provider";
import { useEffect, type ReactNode } from "react";

export function DashboardGuard({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      sessionManager.onAuthFailure();
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background p-6 lg:p-8">
        <div className="hidden w-64 shrink-0 lg:block">
          <Skeleton className="h-full min-h-[calc(100vh-4rem)]" />
        </div>
        <div className="flex-1 space-y-4">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
