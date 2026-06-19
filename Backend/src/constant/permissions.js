import { ROLES } from "./roles.js";

export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: [ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.EMPLOYEE],
  [ROLES.ADMIN]: [ROLES.MANAGER, ROLES.HR, ROLES.EMPLOYEE],
  [ROLES.MANAGER]: [ROLES.HR, ROLES.EMPLOYEE],
  [ROLES.HR]: [ROLES.EMPLOYEE],
  [ROLES.EMPLOYEE]: [],
};

export const ROLE_ACTIONS = {
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

export const EMPLOYEE_RECORD_ACTIONS = {
  [ROLES.SUPER_ADMIN]: ["create", "read", "update", "delete"],
  [ROLES.ADMIN]: ["create", "read", "update", "delete"],
  [ROLES.MANAGER]: ["read", "update", "delete"],
  [ROLES.HR]: ["create", "read", "update", "delete"],
  [ROLES.EMPLOYEE]: [],
};

export function canPerformAction(actorRole, targetRole, action) {
  return ROLE_ACTIONS[actorRole]?.[targetRole]?.includes(action) ?? false;
}

export function canManageEmployeeRecord(actorRole, action) {
  return EMPLOYEE_RECORD_ACTIONS[actorRole]?.includes(action) ?? false;
}

export const ATTENDANCE_ACTIONS = {
  super_admin: ["read", "manage"],
  admin: ["read", "manage"],
  manager: ["read"],
  hr: ["read", "manage"],
  employee: [],
};

export function canManageAttendance(actorRole, action) {
  return ATTENDANCE_ACTIONS[actorRole]?.includes(action) ?? false;
}

export const PRODUCTION_ACTIONS = {
  super_admin: ["read", "manage"],
  admin: ["read", "manage"],
  manager: ["read"],
  hr: ["read", "manage"],
  employee: [],
};

export function canManageProduction(actorRole, action) {
  return PRODUCTION_ACTIONS[actorRole]?.includes(action) ?? false;
}

export function getManagedRoles(actorRole) {
  return ROLE_HIERARCHY[actorRole] ?? [];
}
