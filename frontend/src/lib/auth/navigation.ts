import type { Role } from "@/lib/constants/roles";
import {
  canManageEmployee,
  canReadAttendance,
  canReadProduction,
  canReadUsers,
} from "@/lib/auth/permissions";
import {
  Activity,
  ClipboardList,
  Cog,
  Factory,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  visible: (role: Role) => boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Production Command",
    href: "/production",
    icon: Factory,
    visible: canReadProduction,
  },
  {
    label: "Live Rounds",
    href: "/production/live",
    icon: Activity,
    visible: canReadProduction,
  },
  {
    label: "Machines",
    href: "/production/machines",
    icon: Cog,
    visible: canReadProduction,
  },
  {
    label: "Floor Monitor",
    href: "/overview",
    icon: LayoutDashboard,
    visible: canReadAttendance,
  },
  {
    label: "Live Gate",
    href: "/live-floor",
    icon: Activity,
    visible: canReadAttendance,
  },
  {
    label: "Daily Roll",
    href: "/attendance",
    icon: ClipboardList,
    visible: canReadAttendance,
  },
  {
    label: "Workforce",
    href: "/workforce",
    icon: Users,
    visible: (role) => canManageEmployee(role, "read"),
  },
  {
    label: "Portal Users",
    href: "/users",
    icon: Shield,
    visible: canReadUsers,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    visible: () => true,
  },
];

export function getNavItems(role: Role) {
  return NAV_ITEMS.filter((item) => item.visible(role));
}
