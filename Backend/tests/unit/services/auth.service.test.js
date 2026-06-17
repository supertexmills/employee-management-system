import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import Admin from "../../../src/models/admin/admin.model.js";
import { comparePassword } from "../../../src/utils/password.js";
import { connectTestDb, clearDatabase, disconnectTestDb } from "../../helpers/db.js";
import { createSuperAdmin, DEFAULT_PASSWORD } from "../../helpers/factories/admin.factory.js";
import * as authService from "../../../src/services/auth.service.js";

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("auth.service refresh", () => {
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

  it("stores a new refresh hash after rotation", async () => {
    const login = await authService.login("admin@test.local", DEFAULT_PASSWORD);
    const userBefore = await Admin.findOne({ email: "admin@test.local" }).select("+refreshToken");

    await wait(1100);
    const rotated = await authService.refresh(login.refreshToken);

    const userAfter = await Admin.findOne({ email: "admin@test.local" }).select("+refreshToken");
    expect(rotated.refreshToken).not.toBe(login.refreshToken);
    expect(userAfter.refreshToken).not.toBe(userBefore.refreshToken);
    expect(await comparePassword(rotated.refreshToken, userAfter.refreshToken)).toBe(true);
  });
});
