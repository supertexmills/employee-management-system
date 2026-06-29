import {
  canManageEmployeeRecord,
  canManageProduction,
  getManagedRoles,
} from "../constant/permissions.js";
import { AppError } from "../utils/AppError.js";

export function authorizeEmployeeAction(action) {
  return (req, _res, next) => {
    if (!canManageEmployeeRecord(req.user.role, action)) {
      return next(new AppError("Forbidden: insufficient permissions", 403));
    }
    next();
  };
}

export function authorizeProductionAction(action) {
  return (req, _res, next) => {
    if (!canManageProduction(req.user.role, action)) {
      return next(new AppError("Forbidden: insufficient permissions", 403));
    }
    next();
  };
}

export function requireAdminAccess(req, _res, next) {
  if (getManagedRoles(req.user.role).length === 0) {
    return next(new AppError("Forbidden: insufficient permissions", 403));
  }
  next();
}
