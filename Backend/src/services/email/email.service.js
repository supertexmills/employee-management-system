import nodemailer from "nodemailer";
import { env } from "../../config/env.js";
import {
  buildFromAddress,
  PASSWORD_RESET_EMAIL,
  SMTP_TRANSPORT,
} from "../../constant/email.js";
import { OTP_EXPIRES_MINUTES } from "../../constant/passwordReset.js";
import { AppError } from "../../utils/AppError.js";

let transporter = null;
let lastSentOtp = null;

function isSmtpConfigured() {
  return Boolean(env.smtpUser && env.smtpPass);
}

function resetTransporter() {
  transporter = null;
}

function getTransporter() {
  if (!isSmtpConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_TRANSPORT.host,
      port: SMTP_TRANSPORT.port,
      secure: SMTP_TRANSPORT.secure,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
      connectionTimeout: SMTP_TRANSPORT.connectionTimeoutMs,
      greetingTimeout: SMTP_TRANSPORT.greetingTimeoutMs,
    });
  }
  return transporter;
}

function logDevOtp(to, otp, reason) {
  if (env.isProduction) return;
  const prefix = reason ? `[dev] SMTP unavailable (${reason})` : "[dev]";
  console.warn(`${prefix} — password reset OTP for ${to}: ${otp}`);
}

export function getLastSentOtpForTests() {
  return lastSentOtp;
}

export function clearLastSentOtpForTests() {
  lastSentOtp = null;
}

export async function sendPasswordResetOtp(to, otp) {
  const subject = PASSWORD_RESET_EMAIL.subject;
  const text = `Your verification code is ${otp}. It expires in ${OTP_EXPIRES_MINUTES} minutes. Do not share this code.`;

  if (env.isTest) {
    lastSentOtp = { to, otp };
    return;
  }

  const mailer = getTransporter();
  if (!mailer) {
    logDevOtp(to, otp, "SMTP_USER/SMTP_PASS not set");
    return;
  }

  try {
    await mailer.sendMail({
      from: buildFromAddress(env.smtpUser),
      to,
      subject,
      text,
    });
  } catch (err) {
    resetTransporter();

    const smtpCode = err?.code ?? "UNKNOWN";
    console.error(`[email] Failed to send password reset OTP (${smtpCode}):`, err.message);

    if (!env.isProduction) {
      logDevOtp(to, otp, smtpCode);
      return;
    }

    throw new AppError("Unable to send verification email. Please try again later.", 503);
  }
}
