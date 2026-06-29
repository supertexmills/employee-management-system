import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { connectTestDb, clearDatabase, disconnectTestDb } from "../../helpers/db.js";
import { createSuperAdmin } from "../../helpers/factories/admin.factory.js";
import {
  loginAs,
  refreshSession,
} from "../../helpers/auth.js";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("POST /api/auth/refresh", () => {
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

  it("rotates refresh token on valid refresh", async () => {
    const login = await loginAs("admin@test.local");
    const oldRefresh = login.cookies.refreshToken;

    await wait(1100);
    const refreshRes = await refreshSession(login);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.success).toBe(true);
    expect(login.cookies.refreshToken).toBeTruthy();
    expect(login.cookies.refreshToken).not.toBe(oldRefresh);
  });

  it("accepts a valid refresh cookie and returns a new session", async () => {
    const login = await loginAs("admin@test.local");

    await wait(1100);
    const refreshRes = await refreshSession(login);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.success).toBe(true);
    expect(login.cookies.accessToken).toBeTruthy();
    expect(login.cookies.csrfToken).toBeTruthy();
  });
});
