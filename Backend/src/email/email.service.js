import crypto from "crypto";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { createEmailProvider } from "./email.factory.js";
import { EMAIL_TEMPLATES } from "./templates/index.js";

export function hashEmailForLog(email) {
  return crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex").slice(0, 16);
}

export async function sendTemplatedEmail(type, to, payload) {
  const templateFn = EMAIL_TEMPLATES[type];
  if (!templateFn) {
    throw new Error(`Unknown email template type: ${type}`);
  }

  const { subject, text, html } = templateFn(payload);
  const provider = createEmailProvider();

  if (!env.isTest && !env.isProduction && !env.smtpUser && env.emailProvider !== "memory") {
    logger.warn(
      { emailHash: hashEmailForLog(to), type },
      "SMTP not configured — email not sent (dev mode)",
    );
    return;
  }

  await provider.send({ to, subject, text, html });

  logger.info({ emailHash: hashEmailForLog(to), type }, "email_sent");
}

export async function verifyEmailProvider() {
  if (env.isTest || env.emailProvider === "memory") {
    return true;
  }

  const provider = createEmailProvider();
  return provider.verify();
}

export function getEmailHealthStatus() {
  if (env.isTest || env.emailProvider === "memory") {
    return { status: "ok", provider: env.emailProvider };
  }

  if (!env.smtpUser || !env.smtpPass) {
    return { status: "not_configured", provider: "smtp" };
  }

  return { status: "ok", provider: "smtp" };
}
