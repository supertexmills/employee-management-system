import { describe, it, expect } from "vitest";
import mongoose from "mongoose";
import { ROLES } from "../../../src/constant/roles.js";
import { AppError } from "../../../src/utils/AppError.js";
import {
  assertCanCreateUser,
  assertCanModifyUser,
  assertCanReadUser,
  assertCanManageEmployee,
  assertCanChangeRole,
} from "../../../src/services/rbac.service.js";

function actor(role, id = new mongoose.Types.ObjectId()) {
  return { _id: id, role };
}

function targetUser(role, id = new mongoose.Types.ObjectId()) {
  return { _id: id, role };
}

describe("rbac.service", () => {
  describe("assertCanCreateUser", () => {
    it("blocks creating super_admin via API", () => {
      expect(() => assertCanCreateUser(actor(ROLES.SUPER_ADMIN), ROLES.SUPER_ADMIN)).toThrow(
        AppError
      );
      expect(() => assertCanCreateUser(actor(ROLES.SUPER_ADMIN), ROLES.SUPER_ADMIN)).toThrow(
        /Cannot create super_admin/
      );
    });

    it("allows super_admin to create hr", () => {
      expect(() => assertCanCreateUser(actor(ROLES.SUPER_ADMIN), ROLES.HR)).not.toThrow();
    });

    it("denies hr from creating admin", () => {
      expect(() => assertCanCreateUser(actor(ROLES.HR), ROLES.ADMIN)).toThrow(/Forbidden/);
    });
  });

  describe("assertCanModifyUser", () => {
    it("blocks self-modification", () => {
      const id = new mongoose.Types.ObjectId();
      expect(() =>
        assertCanModifyUser(actor(ROLES.ADMIN, id), targetUser(ROLES.ADMIN, id), "update")
      ).toThrow(/your own account/);
    });

    it("allows admin to update manager", () => {
      expect(() =>
        assertCanModifyUser(actor(ROLES.ADMIN), targetUser(ROLES.MANAGER), "update")
      ).not.toThrow();
    });
  });

  describe("assertCanReadUser", () => {
    it("allows reading own profile", () => {
      const id = new mongoose.Types.ObjectId();
      expect(() =>
        assertCanReadUser(actor(ROLES.HR, id), targetUser(ROLES.HR, id))
      ).not.toThrow();
    });

    it("denies employee reading admin", () => {
      expect(() =>
        assertCanReadUser(actor(ROLES.EMPLOYEE), targetUser(ROLES.ADMIN))
      ).toThrow(/Forbidden/);
    });
  });

  describe("assertCanManageEmployee", () => {
    it("allows hr to create employees", () => {
      expect(() => assertCanManageEmployee(actor(ROLES.HR), "create")).not.toThrow();
    });

    it("denies employee employee-record access", () => {
      expect(() => assertCanManageEmployee(actor(ROLES.EMPLOYEE), "read")).toThrow(/Forbidden/);
    });
  });

  describe("assertCanChangeRole", () => {
    it("blocks assigning super_admin", () => {
      expect(() =>
        assertCanChangeRole(actor(ROLES.SUPER_ADMIN), ROLES.HR, ROLES.SUPER_ADMIN)
      ).toThrow(/Cannot assign super_admin/);
    });

    it("no-ops when role unchanged", () => {
      expect(() =>
        assertCanChangeRole(actor(ROLES.ADMIN), ROLES.HR, ROLES.HR)
      ).not.toThrow();
    });
  });
});
