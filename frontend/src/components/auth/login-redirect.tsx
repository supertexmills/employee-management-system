"use client";

import { useAuth } from "@/providers/auth-provider";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function LoginRedirect() {
  const { isAuthenticated, isLoading, getRoleHome } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    const from = searchParams.get("from");
    const destination =
      from && from.startsWith("/") && !from.startsWith("/login")
        ? from
        : getRoleHome();

    router.replace(destination);
  }, [isAuthenticated, isLoading, getRoleHome, router, searchParams]);

  return null;
}
