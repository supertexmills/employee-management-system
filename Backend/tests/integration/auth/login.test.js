import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../../helpers/app.js";
import { connectTestDb, clearDatabase, disconnectTestDb } from "../../helpers/db.js";
import { createSuperAdmin, DEFAULT_PASSWORD } from "../../helpers/factories/admin.factory.js";
import { loginAs } from "../../helpers/auth.js";

describe("POST /api/auth/login", () => {
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

  it("returns 200 and establishes an authenticated session", async () => {
    const { res, agent, csrfToken } = await loginAs("admin@test.local");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe("admin@test.local");
    expect(csrfToken).toBeTruthy();

    const meRes = await agent.get("/api/auth/me");
    expect(meRes.status).toBe(200);
    expect(meRes.body.data.email).toBe("admin@test.local");
  });

  it("returns 401 for invalid password", async () => {
    const app = getTestApp();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.local", password: "WrongPass1!" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 401 for inactive user", async () => {
    await clearDatabase();
    await createSuperAdmin({ status: "inactive" });

    const app = getTestApp();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.local", password: DEFAULT_PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Invalid credentials/i);
  });
});
