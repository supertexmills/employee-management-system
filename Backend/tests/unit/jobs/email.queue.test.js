import { describe, it, expect, beforeEach } from "vitest";
import { enqueuePasswordResetEmail } from "../../../src/jobs/email.queue.js";
import {
  clearLastSentEmail,
  extractOtpFromLastEmail,
} from "../../../src/email/providers/memory.provider.js";
import { resetEmailProvider } from "../../../src/email/email.factory.js";

describe("email queue (test mode)", () => {
  beforeEach(() => {
    clearLastSentEmail();
    resetEmailProvider();
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
