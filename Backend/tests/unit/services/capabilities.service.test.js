import { describe, it, expect } from "vitest";
import { ROLES } from "../../../src/constant/roles.js";
import { getCapabilities } from "../../../src/services/capabilities.service.js";

describe("getCapabilities", () => {
  it("grants full employee and production manage access to super_admin", () => {
    const caps = getCapabilities(ROLES.SUPER_ADMIN);

    expect(caps.employees.create).toBe(true);
    expect(caps.production.manage).toBe(true);
    expect(caps.admins.manage).toBe(true);
  });

  it("denies production manage for manager", () => {
    const caps = getCapabilities(ROLES.MANAGER);

    expect(caps.production.read).toBe(true);
    expect(caps.production.manage).toBe(false);
    expect(caps.admins.manage).toBe(false);
  });

  it("denies admin list access for employee role", () => {
    const caps = getCapabilities(ROLES.EMPLOYEE);

    expect(caps.admins.read).toBe(false);
    expect(caps.employees.read).toBe(false);
  });
});
