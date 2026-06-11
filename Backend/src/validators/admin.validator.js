import { z } from "zod";
import { ROLES } from "../constant/roles.js";

const updatableRoles = [
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.HR,
  ROLES.EMPLOYEE,
];

export const listAdminQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(updatableRoles).optional(),
  status: z.enum(["pending", "active", "inactive", "suspended"]).optional(),
});

export const updateAdminSchema = z
  .object({
    username: z.string().trim().min(3).max(50).optional(),
    email: z.string().email().optional(),
    role: z.enum(updatableRoles).optional(),
    status: z.enum(["pending", "active", "inactive", "suspended"]).optional(),
    profilePicture: z.string().trim().nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const adminIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid admin id"),
});
