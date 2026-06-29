import crypto from "crypto";
import { env } from "../config/env.js";
import { OTP_LENGTH } from "../constant/passwordReset.js";

export function generateOtp() {
  return crypto.randomInt(0, 10 ** OTP_LENGTH).toString().padStart(OTP_LENGTH, "0");
}

export function hashOtp(otp) {
  return crypto.createHmac("sha256", env.otpPepper).update(otp).digest("hex");
}

export function verifyOtp(otp, hash) {
  if (!otp || !hash) return false;

  const expected = hashOtp(otp);
  const expectedBuf = Buffer.from(expected, "hex");
  const hashBuf = Buffer.from(hash, "hex");

  if (expectedBuf.length !== hashBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, hashBuf);
}
