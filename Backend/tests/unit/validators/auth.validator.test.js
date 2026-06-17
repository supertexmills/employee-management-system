import { describe, it, expect } from "vitest";
import { ROLES } from "../../../src/constant/roles.js";
import { loginSchema, registerSchema } from "../../../src/validators/auth.validator.js";

describe("auth.validator", () => {
  describe("loginSchema", () => {
    it("accepts valid login payload", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "password1",
      });

      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = loginSchema.safeParse({
        email: "not-email",
        password: "password1",
      });

      expect(result.success).toBe(false);
    });

    it("rejects short password", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "short",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("accepts valid registration payload", () => {
      const result = registerSchema.safeParse({
        username: "newuser",
        email: "new@example.com",
        password: "password1",
        role: ROLES.HR,
      });

      expect(result.success).toBe(true);
    });

    it("rejects super_admin role", () => {
      const result = registerSchema.safeParse({
        username: "newuser",
        email: "new@example.com",
        password: "password1",
        role: ROLES.SUPER_ADMIN,
      });

      expect(result.success).toBe(false);
    });

    it("rejects short username", () => {
      const result = registerSchema.safeParse({
        username: "ab",
        email: "new@example.com",
        password: "password1",
        role: ROLES.EMPLOYEE,
      });

      expect(result.success).toBe(false);
    });
  });
});
