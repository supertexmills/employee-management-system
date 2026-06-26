import { z } from "zod";

const departments = [
  "Production",
  "Quality",
  "Maintenance",
  "HR",
  "Accounts",
  "Store",
];

const shifts = ["morning", "evening", "night"];

const addressSchema = z
  .object({
    street: z.string().trim().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    pincode: z.string().trim().optional(),
  })
  .optional();

export const createEmployeeSchema = z.object({
  employeeName: z.string().trim().min(3).max(100),
  phoneNumber: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
  department: z.enum(departments),
  designation: z.string().trim().min(1),
  rfid: z.string().trim().min(1),
  shift: z.enum(shifts),
  address: addressSchema,
  joinedDate: z.coerce.date().optional(),
  profilePicture: z.string().trim().nullable().optional(),
}).strict();

export const updateEmployeeSchema = z
  .object({
    employeeName: z.string().trim().min(3).max(100).optional(),
    phoneNumber: z
      .string()
      .regex(/^[0-9]{10}$/, "Phone must be 10 digits")
      .optional(),
    department: z.enum(departments).optional(),
    designation: z.string().trim().min(1).optional(),
    rfid: z.string().trim().min(1).optional(),
    shift: z.enum(shifts).optional(),
    address: addressSchema,
    joinedDate: z.coerce.date().optional(),
    profilePicture: z.string().trim().nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })
  .strict();

export const listEmployeeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  department: z.enum(departments).optional(),
  shift: z.enum(shifts).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  isActive: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export const employeeIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid employee id"),
});
