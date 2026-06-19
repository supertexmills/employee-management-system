import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../helpers/app.js";
import { connectTestDb, clearDatabase, disconnectTestDb } from "../helpers/db.js";

describe("GET /api/health", () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it("returns ok when database is connected", async () => {
    const app = getTestApp();
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.db).toBe("ok");
    expect(res.body.status).toBe("ok");
  });
});
