import { z } from "zod";
import { ROLES } from "../constant/roles.js";

const registerableRoles = [
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.HR,
  ROLES.EMPLOYEE,
];

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(registerableRoles, { message: "Invalid role" }),
});

export const updateProfileSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must be at most 50 characters")
      .optional(),
    email: z.string().email("Invalid email").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const resendOtpSchema = z.object({
  email: z.string().email("Invalid email"),
});

export const resetPasswordSchema = z
  .object({
    email: z.string().email("Invalid email"),
    otp: z
      .string()
      .length(6, "OTP must be 6 digits")
      .regex(/^\d{6}$/, "OTP must be 6 digits"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
