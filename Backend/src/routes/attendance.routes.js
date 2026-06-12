import { Router } from "express";
import * as attendanceController from "../controllers/attendance/attendance.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeAttendanceAction } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  liveSummaryQuerySchema,
  liveFloorQuerySchema,
  employeeIdParamSchema,
  employeeHistoryQuerySchema,
} from "../validators/attendance.validator.js";

const router = Router();

router.use(authenticate);

router.get(
  "/summary/today",
  authorizeAttendanceAction("read"),
  validate(liveSummaryQuerySchema, "query"),
  attendanceController.todaySummary
);

router.get(
  "/live",
  authorizeAttendanceAction("read"),
  validate(liveFloorQuerySchema, "query"),
  attendanceController.liveFloor
);

router.get(
  "/employees/:id/today",
  authorizeAttendanceAction("read"),
  validate(employeeIdParamSchema, "params"),
  attendanceController.employeeToday
);

router.get(
  "/employees/:id/history",
  authorizeAttendanceAction("read"),
  validate(employeeIdParamSchema, "params"),
  validate(employeeHistoryQuerySchema, "query"),
  attendanceController.employeeHistory
);

export default router;
