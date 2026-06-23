import { describe, it, expect } from "vitest";
import { ROLES } from "../../../src/constant/roles.js";
import {
  canPerformAction,
  canManageEmployeeRecord,
  canManageProduction,
  getManagedRoles,
} from "../../../src/constant/permissions.js";

describe("permissions", () => {
  describe("canPerformAction", () => {
    it("allows super_admin to create admin", () => {
      expect(canPerformAction(ROLES.SUPER_ADMIN, ROLES.ADMIN, "create")).toBe(true);
    });

    it("denies manager from creating hr", () => {
      expect(canPerformAction(ROLES.MANAGER, ROLES.HR, "create")).toBe(false);
    });

    it("allows hr to create employee", () => {
      expect(canPerformAction(ROLES.HR, ROLES.EMPLOYEE, "create")).toBe(true);
    });

    it("denies employee from any user management", () => {
      expect(canPerformAction(ROLES.EMPLOYEE, ROLES.HR, "read")).toBe(false);
    });
  });

  describe("canManageEmployeeRecord", () => {
    it("allows hr to create employees", () => {
      expect(canManageEmployeeRecord(ROLES.HR, "create")).toBe(true);
    });

    it("denies manager from creating employees", () => {
      expect(canManageEmployeeRecord(ROLES.MANAGER, "create")).toBe(false);
    });

    it("allows manager to read employees", () => {
      expect(canManageEmployeeRecord(ROLES.MANAGER, "read")).toBe(true);
    });
  });

  describe("canManageProduction", () => {
    it("allows hr to manage production", () => {
      expect(canManageProduction(ROLES.HR, "manage")).toBe(true);
    });

    it("denies employee production access", () => {
      expect(canManageProduction(ROLES.EMPLOYEE, "read")).toBe(false);
    });
  });

  describe("getManagedRoles", () => {
    it("returns managed roles for admin", () => {
      expect(getManagedRoles(ROLES.ADMIN)).toEqual([
        ROLES.MANAGER,
        ROLES.HR,
        ROLES.EMPLOYEE,
      ]);
    });
  });
});
