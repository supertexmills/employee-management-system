import { describe, it, expect } from "vitest";
import { buildPasswordResetEmail } from "../../../src/email/templates/passwordReset.template.js";

describe("passwordReset template", () => {
  it("includes expiry and security copy", () => {
    const { subject, text, html } = buildPasswordResetEmail({
      otp: "123456",
      expiresMinutes: 5,
    });

    expect(subject).toContain("password reset");
    expect(text).toContain("123456");
    expect(text).toContain("5 minutes");
    expect(text).toContain("Do not share");
    expect(html).toContain("123456");
    expect(html).not.toContain("undefined");
  });
});
