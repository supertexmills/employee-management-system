import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import { getTestApp } from "../../helpers/app.js";
import { connectTestDb, clearDatabase, disconnectTestDb } from "../../helpers/db.js";
import {
  createAdmin,
  createSuperAdmin,
  DEFAULT_PASSWORD,
} from "../../helpers/factories/admin.factory.js";
import { loginAs } from "../../helpers/auth.js";
import { ROLES } from "../../../src/constant/roles.js";
import PasswordReset from "../../../src/models/auth/passwordReset.model.js";
import {
  clearLastSentEmail,
  extractOtpFromLastEmail,
} from "../../../src/email/providers/memory.provider.js";
import { resetEmailProvider } from "../../../src/email/email.factory.js";
import { GENERIC_RESET_MESSAGE, MAX_OTP_SENDS_PER_24H } from "../../../src/constant/passwordReset.js";

describe("POST /api/auth/forgot-password flow", () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await clearDatabase();
    clearLastSentEmail();
    resetEmailProvider();
    await createSuperAdmin();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it("returns generic success and sends OTP for eligible admin", async () => {
    const app = getTestApp();
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "admin@test.local" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(GENERIC_RESET_MESSAGE);

    const sent = extractOtpFromLastEmail();
    expect(sent?.to).toBe("admin@test.local");
    expect(sent?.otp).toMatch(/^\d{6}$/);

    const record = await PasswordReset.findOne({ email: "admin@test.local" });
    expect(record?.emailStatus).toBe("sent");
  });

  it("returns generic success for unknown email without sending OTP", async () => {
    const app = getTestApp();
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "missing@test.local" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(GENERIC_RESET_MESSAGE);
    expect(extractOtpFromLastEmail()).toBeNull();
  });

  it("does not send OTP for employee role", async () => {
    await createAdmin({
      role: ROLES.EMPLOYEE,
      email: "employee@test.local",
      username: "employeeuser",
    });

    const app = getTestApp();
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "employee@test.local" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(GENERIC_RESET_MESSAGE);
    expect(extractOtpFromLastEmail()).toBeNull();
  });

  it("resets password with valid OTP and allows login with new password", async () => {
    const app = getTestApp();
    const newPassword = "NewSecure99!";

    await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "admin@test.local" });

    const { otp } = extractOtpFromLastEmail();

    const resetRes = await request(app).post("/api/auth/reset-password").send({
      email: "admin@test.local",
      otp,
      newPassword,
      confirmPassword: newPassword,
    });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.message).toContain("Password updated");

    const oldLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.local", password: DEFAULT_PASSWORD });
    expect(oldLogin.status).toBe(401);

    const newLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@test.local", password: newPassword });
    expect(newLogin.status).toBe(200);
  });

  it("rejects expired OTP", async () => {
    const app = getTestApp();

    await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "admin@test.local" });

    const { otp } = extractOtpFromLastEmail();

    await PasswordReset.updateOne(
      { email: "admin@test.local" },
      { expiresAt: new Date(Date.now() - 1000) },
    );

    const resetRes = await request(app).post("/api/auth/reset-password").send({
      email: "admin@test.local",
      otp,
      newPassword: "NewSecure99!",
      confirmPassword: "NewSecure99!",
    });

    expect(resetRes.status).toBe(400);
    expect(resetRes.body.message).toContain("expired");
  });

  it("rejects invalid OTP and increments attempts", async () => {
    const app = getTestApp();

    await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "admin@test.local" });

    const resetRes = await request(app).post("/api/auth/reset-password").send({
      email: "admin@test.local",
      otp: "000000",
      newPassword: "NewSecure99!",
      confirmPassword: "NewSecure99!",
    });

    expect(resetRes.status).toBe(400);
    expect(resetRes.body.message).toContain("Invalid");

    const record = await PasswordReset.findOne({ email: "admin@test.local" });
    expect(record?.attempts).toBe(1);
  });

  it("resend invalidates previous OTP", async () => {
    const app = getTestApp();

    await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "admin@test.local" });

    const firstOtp = extractOtpFromLastEmail()?.otp;

    await PasswordReset.updateOne(
      { email: "admin@test.local" },
      { lastSentAt: new Date(Date.now() - 120_000) },
    );

    await request(app).post("/api/auth/resend-otp").send({ email: "admin@test.local" });

    const secondOtp = extractOtpFromLastEmail()?.otp;
    expect(secondOtp).not.toBe(firstOtp);

    const oldOtpRes = await request(app).post("/api/auth/reset-password").send({
      email: "admin@test.local",
      otp: firstOtp,
      newPassword: "NewSecure99!",
      confirmPassword: "NewSecure99!",
    });
    expect(oldOtpRes.status).toBe(400);

    const newOtpRes = await request(app).post("/api/auth/reset-password").send({
      email: "admin@test.local",
      otp: secondOtp,
      newPassword: "NewSecure99!",
      confirmPassword: "NewSecure99!",
    });
    expect(newOtpRes.status).toBe(200);
  });

  it("returns 429 when resend is within cooldown", async () => {
    const app = getTestApp();

    await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "admin@test.local" });

    const resendRes = await request(app)
      .post("/api/auth/resend-otp")
      .send({ email: "admin@test.local" });

    expect(resendRes.status).toBe(429);
  });

  it("returns 429 when per-email 24h send cap is exceeded", async () => {
    const app = getTestApp();
    const now = new Date();

    await PasswordReset.findOneAndUpdate(
      { email: "admin@test.local" },
      {
        email: "admin@test.local",
        otpHash: "placeholder",
        expiresAt: new Date(Date.now() + 60_000),
        lastSentAt: now,
        sendCount: MAX_OTP_SENDS_PER_24H,
        sendCountWindowStart: now,
      },
      { upsert: true },
    );

    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "admin@test.local" });

    expect(res.status).toBe(429);
  });

  it("revokes existing session after password reset", async () => {
    const app = getTestApp();
    const login = await loginAs("admin@test.local");

    await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "admin@test.local" });

    const { otp } = extractOtpFromLastEmail();
    const newPassword = "NewSecure99!";

    await request(app).post("/api/auth/reset-password").send({
      email: "admin@test.local",
      otp,
      newPassword,
      confirmPassword: newPassword,
    });

    const meRes = await login.agent.get("/api/auth/me");
    expect(meRes.status).toBe(401);
  });
});
