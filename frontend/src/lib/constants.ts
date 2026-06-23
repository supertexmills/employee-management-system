export const DEPARTMENTS = [
  "Production",
  "Quality",
  "Maintenance",
  "HR",
  "Accounts",
  "Store",
] as const;

export const SHIFTS = ["morning", "evening", "night"] as const;

export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  HR: "hr",
  EMPLOYEE: "employee",
} as const;

export type Department = (typeof DEPARTMENTS)[number];
export type Shift = (typeof SHIFTS)[number];
export type Role = (typeof ROLES)[keyof typeof ROLES];
