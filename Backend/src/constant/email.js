/**
 * Production email transport — all SMTP settings except credentials live here.
 * Set only SMTP_USER and SMTP_PASS in .env (Gmail address + app password).
 */
export const SMTP_TRANSPORT = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  connectionTimeoutMs: 8_000,
  greetingTimeoutMs: 8_000,
};

export const EMAIL_BRAND = {
  displayName: "SuperTex Mills",
};

export const PASSWORD_RESET_EMAIL = {
  subject: "Your password reset code",
};

export function buildFromAddress(senderEmail) {
  return `${EMAIL_BRAND.displayName} <${senderEmail}>`;
}
