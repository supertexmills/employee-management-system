"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Factory,
  LayoutDashboard,
  Radio,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/providers/auth-provider";
import {
  canManageAdmins,
  canManageProduction,
  canReadProduction,
} from "@/lib/rbac";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/production", label: "Production", icon: Factory, permission: "production" },
];

const generalItems = [
  { href: "/admins", label: "Admins", icon: Shield, permission: "admins" },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const showProduction = user && canReadProduction(user);
  const showAdmins = user && canManageAdmins(user);
  const showManage = user && canManageProduction(user);

  const filteredMenu = menuItems.filter((item) => {
    if (item.permission === "production") return showProduction;
    return true;
  });

  const filteredGeneral = generalItems.filter((item) => {
    if (item.permission === "admins") return showAdmins;
    return true;
  });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Factory className="size-5" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-bold tracking-tight">Factory Flow</p>
            <p className="text-xs text-muted-foreground">Production Hub</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenu.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {showManage && (
          <SidebarGroup>
            <SidebarGroupLabel>Production Config</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/production/machines" />}
                    isActive={pathname.startsWith("/production/machines")}
                    tooltip="Machines"
                  >
                    <Factory />
                    <span>Machines</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/production/readers" />}
                    isActive={pathname.startsWith("/production/readers")}
                    tooltip="Readers"
                  >
                    <Radio />
                    <span>Readers</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link href="/production/rounds" />}
                    isActive={pathname.startsWith("/production/rounds")}
                    tooltip="Rounds"
                  >
                    <Activity />
                    <span>Rounds</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredGeneral.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="brand-gradient rounded-xl p-4 text-primary-foreground group-data-[collapsible=icon]:hidden">
          <p className="text-sm font-semibold">Factory Operations</p>
          <p className="mt-1 text-xs text-primary-foreground/80">
            Real-time production round tracking
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
