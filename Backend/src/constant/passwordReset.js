import { ROLES } from "./roles.js";

export const PASSWORD_RESET_ALLOWED_ROLES = [
  ROLES.SUPER_ADMIN,
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.HR,
];

export const OTP_LENGTH = 6;
export const MAX_OTP_ATTEMPTS = 5;
export const OTP_EXPIRES_MINUTES = 5;
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
export const MAX_OTP_SENDS_PER_24H = 5;
export const OTP_SEND_WINDOW_MS = 24 * 60 * 60 * 1000;

export const GENERIC_RESET_MESSAGE =
  "If an account exists for this email, a verification code has been sent.";
