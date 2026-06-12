import { canManageEmployeeRecord, canManageAttendance } from "../constant/permissions.js";
import { AppError } from "../utils/AppError.js";

export function authorizeEmployeeAction(action) {
  return (req, _res, next) => {
    if (!canManageEmployeeRecord(req.user.role, action)) {
      return next(new AppError("Forbidden: insufficient permissions", 403));
    }
    next();
  };
}

export function authorizeAttendanceAction(action) {
  return (req, _res, next) => {
    if (!canManageAttendance(req.user.role, action)) {
      return next(new AppError("Forbidden: insufficient permissions", 403));
    }
    next();
  };
}
