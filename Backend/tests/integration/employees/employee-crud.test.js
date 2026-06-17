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
});
