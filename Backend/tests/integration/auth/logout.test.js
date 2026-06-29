import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../../helpers/app.js";
import { connectTestDb, clearDatabase, disconnectTestDb } from "../../helpers/db.js";
import { createSuperAdmin } from "../../helpers/factories/admin.factory.js";
import { loginAs, withCsrf } from "../../helpers/auth.js";

describe("POST /api/auth/logout", () => {
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

  it("invalidates refresh token after logout", async () => {
    const login = await loginAs("admin@test.local");

    const logoutRes = await withCsrf(login.agent, login.csrfToken).post("/api/auth/logout");
    expect(logoutRes.status).toBe(200);

    const refreshRes = await request(getTestApp())
      .post("/api/auth/refresh")
      .set("Cookie", `refreshToken=${login.cookies.refreshToken}`);
    expect(refreshRes.status).toBe(401);
  });
});
