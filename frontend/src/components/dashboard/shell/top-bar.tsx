"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS } from "@/lib/constants/roles";
import { useAuth } from "@/providers/auth-provider";
import { LogOut, Menu } from "lucide-react";

type TopBarProps = {
  onMenuClick: () => void;
};

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-border/60 bg-white/80 px-3 backdrop-blur-lg sm:h-16 sm:gap-3 sm:px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-surface-alt lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 lg:hidden">
          <p className="truncate text-sm font-semibold text-slate-900">
            FactoryFlow
          </p>
        </div>
      </div>

      {user ? (
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Avatar
            name={user.username}
            src={user.profilePicture}
            className="h-8 w-8 sm:h-9 sm:w-9"
          />
          <div className="hidden min-w-0 text-right md:block">
            <p className="truncate text-sm font-medium text-slate-900">
              {user.username}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {ROLE_LABELS[user.role]}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-2.5 sm:px-4"
            onClick={() => logout()}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      ) : null}
    </header>
  );
}
