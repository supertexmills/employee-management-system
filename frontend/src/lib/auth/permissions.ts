import { ROLES, type RegisterableRole, type Role } from "@/lib/constants/roles";

const ROLE_ACTIONS: Record<Role, Partial<Record<Role, string[]>>> = {
  [ROLES.SUPER_ADMIN]: {
    [ROLES.ADMIN]: ["create", "read", "update", "delete"],
    [ROLES.MANAGER]: ["create", "read", "update", "delete"],
    [ROLES.HR]: ["create", "read", "update", "delete"],
    [ROLES.EMPLOYEE]: ["create", "read", "update", "delete"],
  },
  [ROLES.ADMIN]: {
    [ROLES.MANAGER]: ["create", "read", "update", "delete"],
    [ROLES.HR]: ["create", "read", "update", "delete"],
    [ROLES.EMPLOYEE]: ["create", "read", "update", "delete"],
  },
  [ROLES.MANAGER]: {
    [ROLES.HR]: ["read", "update", "delete"],
    [ROLES.EMPLOYEE]: ["read", "update", "delete"],
  },
  [ROLES.HR]: {
    [ROLES.EMPLOYEE]: ["create", "read", "update", "delete"],
  },
  [ROLES.EMPLOYEE]: {},
};

const EMPLOYEE_RECORD_ACTIONS: Record<Role, string[]> = {
  [ROLES.SUPER_ADMIN]: ["create", "read", "update", "delete"],
  [ROLES.ADMIN]: ["create", "read", "update", "delete"],
  [ROLES.MANAGER]: ["read", "update", "delete"],
  [ROLES.HR]: ["create", "read", "update", "delete"],
  [ROLES.EMPLOYEE]: [],
};

export function canPerformUserAction(
  actorRole: Role,
  targetRole: Role,
  action: string,
) {
  return ROLE_ACTIONS[actorRole]?.[targetRole]?.includes(action) ?? false;
}

export function canManageEmployee(actorRole: Role, action: string) {
  return EMPLOYEE_RECORD_ACTIONS[actorRole]?.includes(action) ?? false;
}

export function getCreatableRoles(actorRole: Role): RegisterableRole[] {
  const map: Partial<Record<Role, RegisterableRole[]>> = {
    [ROLES.SUPER_ADMIN]: [
      ROLES.ADMIN,
      ROLES.MANAGER,
      ROLES.HR,
      ROLES.EMPLOYEE,
    ],
    [ROLES.ADMIN]: [ROLES.MANAGER, ROLES.HR, ROLES.EMPLOYEE],
    [ROLES.HR]: [ROLES.EMPLOYEE],
  };
  return map[actorRole] ?? [];
}

export function canReadUsers(actorRole: Role) {
  return Object.keys(ROLE_ACTIONS[actorRole] ?? {}).length > 0;
}

export function canReadOverview(actorRole: Role) {
  return (
    actorRole === ROLES.SUPER_ADMIN ||
    actorRole === ROLES.ADMIN ||
    actorRole === ROLES.MANAGER ||
    actorRole === ROLES.HR
  );
}

const ATTENDANCE_ACTIONS: Record<Role, string[]> = {
  [ROLES.SUPER_ADMIN]: ["read", "manage"],
  [ROLES.ADMIN]: ["read", "manage"],
  [ROLES.MANAGER]: ["read"],
  [ROLES.HR]: ["read", "manage"],
  [ROLES.EMPLOYEE]: [],
};

export function canReadAttendance(actorRole: Role) {
  return ATTENDANCE_ACTIONS[actorRole]?.includes("read") ?? false;
}

const PRODUCTION_ACTIONS: Record<Role, string[]> = {
  [ROLES.SUPER_ADMIN]: ["read", "manage"],
  [ROLES.ADMIN]: ["read", "manage"],
  [ROLES.MANAGER]: ["read"],
  [ROLES.HR]: ["read", "manage"],
  [ROLES.EMPLOYEE]: [],
};

export function canReadProduction(actorRole: Role) {
  return PRODUCTION_ACTIONS[actorRole]?.includes("read") ?? false;
}

export function canManageProduction(actorRole: Role) {
  return PRODUCTION_ACTIONS[actorRole]?.includes("manage") ?? false;
}
