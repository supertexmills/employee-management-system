import { ROLES } from "../constant/roles.js";
import {
  canManageEmployeeRecord,
  canManageProduction,
  getManagedRoles,
} from "../constant/permissions.js";

export function getCapabilities(role) {
  const managedRoles = getManagedRoles(role);
  const canManageAdmins = [ROLES.SUPER_ADMIN, ROLES.ADMIN].includes(role);

  return {
    employees: {
      create: canManageEmployeeRecord(role, "create"),
      read: canManageEmployeeRecord(role, "read"),
      update: canManageEmployeeRecord(role, "update"),
      delete: canManageEmployeeRecord(role, "delete"),
    },
    production: {
      read: canManageProduction(role, "read"),
      manage: canManageProduction(role, "manage"),
    },
    admins: {
      read: managedRoles.length > 0,
      manage: canManageAdmins,
    },
  };
}
