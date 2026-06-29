import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { ROLES } from "../../../src/constant/roles.js";
import { connectTestDb, clearDatabase, disconnectTestDb } from "../../helpers/db.js";
import {
  createSuperAdmin,
  createHrAdmin,
} from "../../helpers/factories/admin.factory.js";
import { loginAs, withCsrf } from "../../helpers/auth.js";

const employeePayload = {
  employeeName: "Test Employee",
  phoneNumber: "9876543210",
  department: "Production",
  designation: "Operator",
  rfid: "RFID-TEST-001",
  shift: "morning",
};

describe("Employee CRUD + RBAC", () => {
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

  it("allows super_admin to create and read an employee", async () => {
    const login = await loginAs("admin@test.local");

    const createRes = await withCsrf(login.agent, login.csrfToken)
      .post("/api/employees")
      .send(employeePayload);

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.employeeName).toBe(employeePayload.employeeName);

    const employeeId = createRes.body.data._id;

    const getRes = await login.agent.get(`/api/employees/${employeeId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.employeeName).toBe(employeePayload.employeeName);
  });

  it("allows hr to create employees", async () => {
    const hr = await createHrAdmin({ email: "hr@test.local", username: "hruser" });
    const login = await loginAs(hr.email);

    const createRes = await withCsrf(login.agent, login.csrfToken)
      .post("/api/employees")
      .send({
        ...employeePayload,
        phoneNumber: "9876543211",
        rfid: "RFID-TEST-002",
      });

    expect(createRes.status).toBe(201);
  });

  it("denies employee role from creating employees", async () => {
    const employeeAdmin = await createHrAdmin({
      role: ROLES.EMPLOYEE,
      email: "emp@test.local",
      username: "empuser",
    });
    const login = await loginAs(employeeAdmin.email);

    const createRes = await withCsrf(login.agent, login.csrfToken)
      .post("/api/employees")
      .send({
        ...employeePayload,
        phoneNumber: "9876543212",
        rfid: "RFID-TEST-003",
      });

    expect(createRes.status).toBe(403);
  });

  it("finds employees by search across all pages", async () => {
    const login = await loginAs("admin@test.local");
    const uniqueName = "Zephyr Unique Search Target";

    for (let i = 0; i < 25; i += 1) {
      const res = await withCsrf(login.agent, login.csrfToken)
        .post("/api/employees")
        .send({
          ...employeePayload,
          employeeName: i === 0 ? uniqueName : `Bulk Employee ${i}`,
          phoneNumber: String(9876500000 + i),
          rfid: `RFID-BULK-${String(i).padStart(3, "0")}`,
        });
      expect(res.status).toBe(201);
    }

    const listPage1 = await login.agent.get("/api/employees?page=1&limit=20");
    expect(listPage1.body.data.some((e) => e.employeeName === uniqueName)).toBe(false);

    const searchRes = await login.agent.get(
      `/api/employees?search=${encodeURIComponent(uniqueName)}`,
    );
    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data).toHaveLength(1);
    expect(searchRes.body.data[0].employeeName).toBe(uniqueName);
  });

  it("rejects unknown fields on create and ignores client createdBy", async () => {
    const login = await loginAs("admin@test.local");

    const strictRes = await withCsrf(login.agent, login.csrfToken)
      .post("/api/employees")
      .send({
        ...employeePayload,
        phoneNumber: "9876543299",
        rfid: "RFID-STRICT-001",
        createdBy: "000000000000000000000000",
      });

    expect(strictRes.status).toBe(422);

    const createRes = await withCsrf(login.agent, login.csrfToken)
      .post("/api/employees")
      .send({
        ...employeePayload,
        phoneNumber: "9876543298",
        rfid: "RFID-STRICT-002",
      });

    expect(createRes.status).toBe(201);
    expect(String(createRes.body.data.createdBy)).not.toBe("000000000000000000000000");
  });
});
