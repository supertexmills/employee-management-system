import type { ProfileUser } from "@/lib/api/types";

/** UI-only helpers — authorization is enforced on the backend. */
export function canManageEmployees(
  user: ProfileUser | null | undefined,
  action: "create" | "read" | "update" | "delete",
) {
  return user?.capabilities?.employees?.[action] ?? false;
}

export function canManageProduction(user: ProfileUser | null | undefined) {
  return user?.capabilities?.production?.manage ?? false;
}

export function canReadProduction(user: ProfileUser | null | undefined) {
  return user?.capabilities?.production?.read ?? false;
}

export function canManageAdmins(user: ProfileUser | null | undefined) {
  return user?.capabilities?.admins?.manage ?? false;
}

export function canReadAdmins(user: ProfileUser | null | undefined) {
  return user?.capabilities?.admins?.read ?? false;
}
