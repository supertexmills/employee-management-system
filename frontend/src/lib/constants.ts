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

export const ATTENDANCE_STATUSES = [
  "PRESENT",
  "ABSENT",
  "INSIDE",
  "EXITED",
  "LATE",
  "OVERTIME",
  "MISSING_TAG",
  "UNAUTHORIZED",
] as const;

export type Department = (typeof DEPARTMENTS)[number];
export type Shift = (typeof SHIFTS)[number];
export type Role = (typeof ROLES)[keyof typeof ROLES];
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];
