import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { ROLES } from "../../../src/constant/roles.js";
import { connectTestDb, clearDatabase, disconnectTestDb } from "../../helpers/db.js";
import {
  createAdmin,
  createSuperAdmin,
} from "../../helpers/factories/admin.factory.js";
import { loginAs } from "../../helpers/auth.js";

describe("Admin API access", () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await clearDatabase();
    await createSuperAdmin();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it("returns 403 for roles without admin list access", async () => {
    const employee = await createAdmin({
      role: ROLES.EMPLOYEE,
      email: "employee@test.local",
      username: "employeeuser",
    });

    const login = await loginAs(employee.email);
    const res = await login.agent.get("/api/admins");

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("allows super_admin to list admins", async () => {
    const login = await loginAs("admin@test.local");
    const res = await login.agent.get("/api/admins");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
