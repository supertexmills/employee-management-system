import crypto from "crypto";
import SecurityAudit from "../models/auth/securityAudit.model.js";
import { logger } from "../config/logger.js";

export const SECURITY_EVENTS = {
  PASSWORD_RESET_REQUESTED: "PASSWORD_RESET_REQUESTED",
  PASSWORD_RESET_OTP_INVALID: "PASSWORD_RESET_OTP_INVALID",
  PASSWORD_RESET_SUCCESS: "PASSWORD_RESET_SUCCESS",
};

function hashEmail(email) {
  return crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");
}

export async function logSecurityEvent(event, { email, ip, userAgent, meta } = {}) {
  try {
    await SecurityAudit.create({
      event,
      emailHash: email ? hashEmail(email) : undefined,
      ip,
      userAgent,
      meta: meta ?? {},
    });
  } catch (err) {
    logger.error({ err: err.message, event }, "security_audit_log_failed");
  }
}
