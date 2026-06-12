import { z } from "zod";

export const listRfidEventsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  epc: z.string().trim().optional(),
  employeeId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid employee id")
    .optional(),
  action: z.enum(["ENTRY", "EXIT", "UNKNOWN"]).optional(),
});

export const listUnknownTagsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
