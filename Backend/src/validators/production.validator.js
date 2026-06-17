import { z } from "zod";
import { DEPARTMENTS, SHIFTS, READER_TYPES } from "../constant/factory.js";

const departments = DEPARTMENTS;
const shifts = SHIFTS;

export const productionFilterQuerySchema = z.object({
  department: z.enum(departments).optional(),
  shift: z.enum(shifts).optional(),
  machineId: z.string().trim().optional(),
  factoryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "factoryDate must be YYYY-MM-DD")
    .optional(),
});

export const productionStreamQuerySchema = productionFilterQuerySchema;

export const listRoundsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  epc: z.string().trim().optional(),
  employeeId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid employee id")
    .optional(),
  machineId: z.string().trim().optional(),
  shift: z.enum(shifts).optional(),
  department: z.enum(departments).optional(),
  factoryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const roundKeyParamSchema = z.object({
  roundKey: z.string().trim().min(1),
});

export const machineIdParamSchema = z.object({
  machineId: z.string().trim().min(1),
});

export const readerIdParamSchema = z.object({
  readerId: z.string().trim().min(1),
});

export const employeeIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid employee id"),
});

export const employeeHistoryQuerySchema = z.object({
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  machineId: z.string().trim().optional(),
});

export const listMachinesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  department: z.enum(departments).optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export const listReadersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(READER_TYPES).optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export const createMachineBodySchema = z.object({
  machineId: z.string().trim().min(1),
  name: z.string().trim().min(1),
  department: z.enum(departments),
  defaultShift: z.enum(shifts).optional(),
  readerId: z.string().trim().min(1),
  location: z.string().trim().min(1),
  minRoundIntervalSeconds: z.coerce.number().int().min(30).optional(),
  targetRoundsPerShift: z.coerce.number().int().min(0).nullable().optional(),
});

export const updateMachineBodySchema = createMachineBodySchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field required",
  });

export const createReaderBodySchema = z.object({
  readerId: z.string().trim().min(1),
  type: z.enum(READER_TYPES).optional(),
  machineId: z.string().trim().optional(),
  ip: z.string().trim().min(1),
  port: z.coerce.number().int().min(1),
  location: z.string().trim().min(1),
  pollIntervalMs: z.coerce.number().int().min(100).optional(),
});

export const updateReaderBodySchema = createReaderBodySchema
  .partial()
  .extend({
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field required",
  });

export const shiftSummaryQuerySchema = productionFilterQuerySchema.extend({
  shift: z.enum(shifts),
});
