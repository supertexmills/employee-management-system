import { describe, it, expect } from "vitest";
import { generateOtp, hashOtp, verifyOtp } from "../../../src/utils/otp.js";

describe("otp utils", () => {
  it("generates a 6-digit OTP", () => {
    const otp = generateOtp();
    expect(otp).toMatch(/^\d{6}$/);
  });

  it("hashes and verifies OTP correctly", () => {
    const otp = "123456";
    const hash = hashOtp(otp);
    expect(verifyOtp(otp, hash)).toBe(true);
    expect(verifyOtp("000000", hash)).toBe(false);
  });

  it("rejects invalid hash lengths safely", () => {
    expect(verifyOtp("123456", "short")).toBe(false);
    expect(verifyOtp("", "")).toBe(false);
  });
});
