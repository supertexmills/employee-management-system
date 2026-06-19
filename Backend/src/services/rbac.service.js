import { AppError } from "../utils/AppError.js";
import { ROLES } from "../constant/roles.js";
import {
  canPerformAction,
  canManageEmployeeRecord,
  canManageAttendance,
  canManageProduction,
  getManagedRoles,
} from "../constant/permissions.js";

export function assertCanCreateUser(actor, targetRole) {
  if (targetRole === ROLES.SUPER_ADMIN) {
    throw new AppError("Cannot create super_admin via API", 403);
  }
  if (!canPerformAction(actor.role, targetRole, "create")) {
    throw new AppError("Forbidden: cannot create this role", 403);
  }
}

export function assertCanModifyUser(actor, targetUser, action) {
  if (actor._id.equals(targetUser._id)) {
    throw new AppError(`Cannot ${action} your own account`, 403);
  }
  if (!canPerformAction(actor.role, targetUser.role, action)) {
    throw new AppError("Forbidden: insufficient permissions", 403);
  }
}

export function assertCanReadUser(actor, targetUser) {
  if (actor._id.equals(targetUser._id)) {
    return;
  }
  if (!canPerformAction(actor.role, targetUser.role, "read")) {
    throw new AppError("Forbidden: insufficient permissions", 403);
  }
}

export function assertCanManageEmployee(actor, action) {
  if (!canManageEmployeeRecord(actor.role, action)) {
    throw new AppError("Forbidden: insufficient permissions", 403);
  }
}

export function assertCanReadAttendance(actor) {
  if (!canManageAttendance(actor.role, "read")) {
    throw new AppError("Forbidden: insufficient permissions", 403);
  }
}

export function assertCanReadProduction(actor) {
  if (!canManageProduction(actor.role, "read")) {
    throw new AppError("Forbidden: insufficient permissions", 403);
  }
}

export function assertCanManageProduction(actor) {
  if (!canManageProduction(actor.role, "manage")) {
    throw new AppError("Forbidden: insufficient permissions", 403);
  }
}

export function filterUsersByRole(actorRole) {
  const managedRoles = getManagedRoles(actorRole);
  if (managedRoles.length === 0) {
    return null;
  }
  return { role: { $in: managedRoles } };
}

export function assertCanChangeRole(actor, currentRole, newRole) {
  if (currentRole === newRole) return;
  if (newRole === ROLES.SUPER_ADMIN) {
    throw new AppError("Cannot assign super_admin role", 403);
  }
  if (!canPerformAction(actor.role, newRole, "update")) {
    throw new AppError("Forbidden: cannot assign this role", 403);
  }
}
