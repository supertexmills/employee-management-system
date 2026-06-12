"use client";

import { getNavItems } from "@/lib/auth/navigation";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { cn } from "@/lib/cn";
import { useAuth } from "@/providers/auth-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AppSidebarProps = {
  onNavigate?: () => void;
  className?: string;
};

export function AppSidebar({ onNavigate, className }: AppSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const items = getNavItems(user.role);

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col border-r border-border bg-surface",
        className,
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-white">F</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">FactoryFlow</p>
          <p className="text-xs text-muted-foreground">Enterprise HR</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label="Dashboard">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-primary"
                  : "text-slate-600 hover:bg-surface-alt hover:text-slate-900",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <p className="truncate text-sm font-medium text-slate-900">
          {user.username}
        </p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
        <p className="mt-1 text-xs text-primary">{ROLE_LABELS[user.role]}</p>
      </div>
    </aside>
  );
}
