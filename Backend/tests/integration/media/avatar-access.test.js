import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { ROLES } from "../../../src/constant/roles.js";
import { connectTestDb, clearDatabase, disconnectTestDb } from "../../helpers/db.js";
import Admin from "../../../src/models/admin/admin.model.js";
import {
  createAdmin,
  createSuperAdmin,
} from "../../helpers/factories/admin.factory.js";
import { loginAs } from "../../helpers/auth.js";

describe("GET /api/media/avatars/:userId", () => {
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

  it("returns 403 when actor cannot read target user avatar", async () => {
    const manager = await createAdmin({
      role: ROLES.MANAGER,
      email: "manager@test.local",
      username: "manageruser",
    });
    const superAdmin = await Admin.findOne({ email: "admin@test.local" });

    const login = await loginAs(manager.email);
    const res = await login.agent.get(`/api/media/avatars/${superAdmin._id}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 when user has no avatar", async () => {
    const login = await loginAs("admin@test.local");
    const meRes = await login.agent.get("/api/auth/me");
    const userId = meRes.body.data.id;

    const res = await login.agent.get(`/api/media/avatars/${userId}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
