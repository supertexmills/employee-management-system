import nodemailer from "nodemailer";
import { env } from "../../config/env.js";
import { EMAIL_BRAND } from "../../constant/email.js";
import { EmailProvider } from "./email.provider.js";

let transporter = null;

function buildFromAddress() {
  const address = env.emailFromAddress || env.smtpUser;
  return `${env.emailFromName || EMAIL_BRAND.displayName} <${address}>`;
}

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
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
      connectionTimeout: env.smtpConnectionTimeoutMs,
      greetingTimeout: env.smtpGreetingTimeoutMs,
    });
  }
  return transporter;
}

export class SmtpEmailProvider extends EmailProvider {
  async send(message) {
    const mailer = getTransporter();
    if (!mailer) {
      throw new Error("SMTP is not configured");
    }

    try {
      await mailer.sendMail({
        from: buildFromAddress(),
        to: message.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
    } catch (err) {
      resetTransporter();
      throw err;
    }
  }

  async verify() {
    if (!isSmtpConfigured()) {
      return false;
    }

    const mailer = getTransporter();
    if (!mailer) return false;

    await mailer.verify();
    return true;
  }
}

export function isSmtpEmailConfigured() {
  return isSmtpConfigured();
}

export { resetTransporter };
