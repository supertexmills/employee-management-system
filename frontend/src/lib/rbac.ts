import type { Role } from "@/lib/constants";

const EMPLOYEE_RECORD_ACTIONS: Record<Role, string[]> = {
  super_admin: ["create", "read", "update", "delete"],
  admin: ["create", "read", "update", "delete"],
  manager: ["read", "update", "delete"],
  hr: ["create", "read", "update", "delete"],
  employee: [],
};

const PRODUCTION_ACTIONS: Record<Role, string[]> = {
  super_admin: ["read", "manage"],
  admin: ["read", "manage"],
  manager: ["read"],
  hr: ["read", "manage"],
  employee: [],
};

const ADMIN_ROLES: Role[] = ["super_admin", "admin"];

export function canManageEmployees(role: Role, action: string) {
  return EMPLOYEE_RECORD_ACTIONS[role]?.includes(action) ?? false;
}

export function canManageProduction(role: Role) {
  return PRODUCTION_ACTIONS[role]?.includes("manage") ?? false;
}

export function canReadProduction(role: Role) {
  return PRODUCTION_ACTIONS[role]?.includes("read") ?? false;
}

export function canManageAdmins(role: Role) {
  return ADMIN_ROLES.includes(role);
}
