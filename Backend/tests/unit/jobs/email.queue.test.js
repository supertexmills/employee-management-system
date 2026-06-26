import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import { enqueuePasswordResetEmail } from "../../../src/jobs/email.queue.js";
import {
  clearLastSentEmail,
  extractOtpFromLastEmail,
} from "../../../src/email/providers/memory.provider.js";
import { resetEmailProvider } from "../../../src/email/email.factory.js";
import { connectTestDb, clearDatabase, disconnectTestDb } from "../../helpers/db.js";

describe("email queue (test mode)", () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await clearDatabase();
    clearLastSentEmail();
    resetEmailProvider();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it("processes password reset email inline in test mode", async () => {
    await enqueuePasswordResetEmail({
      email: "user@test.local",
      otp: "654321",
      resetId: "507f1f77bcf86cd799439011",
    });

    const sent = extractOtpFromLastEmail();
    expect(sent?.to).toBe("user@test.local");
    expect(sent?.otp).toBe("654321");
  });
});
