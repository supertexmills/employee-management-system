export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MANAGER: "manager",
  HR: "hr",
  EMPLOYEE: "employee",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  hr: "HR",
  employee: "Employee",
};

export const REGISTERABLE_ROLES = [
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.HR,
  ROLES.EMPLOYEE,
] as const;

export type RegisterableRole = (typeof REGISTERABLE_ROLES)[number];

export const ROLE_DESCRIPTIONS: Record<RegisterableRole, string> = {
  admin: "Full system access except super admin controls.",
  manager: "Workforce oversight with limited user management.",
  hr: "Employee records and employee portal account creation.",
  employee: "Self-service portal access only.",
};
