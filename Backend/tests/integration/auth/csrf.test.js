import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { connectTestDb, clearDatabase, disconnectTestDb } from "../../helpers/db.js";
import { createSuperAdmin } from "../../helpers/factories/admin.factory.js";
import { loginAs, withCsrf } from "../../helpers/auth.js";

describe("CSRF protection", () => {
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

  it("allows login without CSRF token", async () => {
    const { res } = await loginAs("admin@test.local");
    expect(res.status).toBe(200);
  });

  it("blocks mutating requests without CSRF token", async () => {
    const login = await loginAs("admin@test.local");

    const res = await login.agent.post("/api/auth/logout");
    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/CSRF/i);
  });

  it("allows mutating requests with matching CSRF token", async () => {
    const login = await loginAs("admin@test.local");

    const res = await withCsrf(login.agent, login.csrfToken).post("/api/auth/logout");
    expect(res.status).toBe(200);
  });
});
