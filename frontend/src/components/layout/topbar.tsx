"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Bell, LogOut, Moon, Search, Sun, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";
import { useQuery } from "@tanstack/react-query";
import * as authApi from "@/lib/api/auth";
import * as rfidApi from "@/lib/api/rfid";
import { canReadAttendance } from "@/lib/rbac";
import { queryKeys } from "@/lib/query-keys";

export function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const { data: unknownTags } = useQuery({
    queryKey: queryKeys.unknownTags(),
    queryFn: () => rfidApi.listUnknownTags({ limit: 1 }),
    enabled: !!user && canReadAttendance(user.role),
    refetchInterval: 60_000,
  });

  const alertCount = unknownTags?.pagination?.total ?? 0;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border/80 bg-background/80 px-4 backdrop-blur-md lg:px-6">
      <SidebarTrigger />
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          className="h-10 rounded-full border-border bg-muted/50 pl-10"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const q = (e.target as HTMLInputElement).value.trim();
              if (q) router.push(`/employees?search=${encodeURIComponent(q)}`);
            }
          }}
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
        {canReadAttendance(user?.role ?? "employee") && (
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full"
            onClick={() => router.push("/rfid")}
          >
            <Bell className="size-5" />
            {alertCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-10 items-center gap-2 rounded-full px-2 outline-none hover:bg-muted">
            <Avatar className="size-8">
              {user?.id && (
                <AvatarImage src={authApi.avatarUrl(user.id)} alt={user.username} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.username?.slice(0, 2).toUpperCase() ?? "ST"}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium leading-none">{user?.username}</p>
              <p className="text-xs capitalize text-muted-foreground">
                {user?.role?.replace("_", " ")}
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <User className="mr-2 size-4" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => void logout()}>
              <LogOut className="mr-2 size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
