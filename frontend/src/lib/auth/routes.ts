import { ROLES, type Role } from "@/lib/constants/roles";

export const ROLE_HOME: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: "/overview",
  [ROLES.ADMIN]: "/overview",
  [ROLES.MANAGER]: "/overview",
  [ROLES.HR]: "/overview",
  [ROLES.EMPLOYEE]: "/settings",
};

export function getRoleHome(role: Role) {
  return ROLE_HOME[role] ?? "/settings";
}

export const PROTECTED_PREFIXES = [
  "/production",
  "/overview",
  "/live-floor",
  "/attendance",
  "/users",
  "/workforce",
  "/settings",
] as const;

export function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
