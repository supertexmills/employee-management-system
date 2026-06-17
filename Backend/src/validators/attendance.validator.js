import { z } from "zod";
import { DEPARTMENTS, SHIFTS } from "../constant/factory.js";

const departments = DEPARTMENTS;
const shifts = SHIFTS;

const attendanceStatuses = [
  "PRESENT",
  "ABSENT",
  "INSIDE",
  "EXITED",
  "LATE",
  "OVERTIME",
  "MISSING_TAG",
  "UNAUTHORIZED",
];

export const liveSummaryQuerySchema = z.object({
  department: z.enum(departments).optional(),
  shift: z.enum(shifts).optional(),
});

export const liveFloorQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  department: z.enum(departments).optional(),
  shift: z.enum(shifts).optional(),
  status: z.enum(attendanceStatuses).optional(),
});

export const employeeIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid employee id"),
});

export const employeeHistoryQuerySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "from must be YYYY-MM-DD")
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "to must be YYYY-MM-DD")
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});
