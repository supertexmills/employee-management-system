import PasswordReset from "../models/auth/passwordReset.model.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { EMAIL_TEMPLATE_TYPES } from "../constant/email.js";
import { OTP_EXPIRES_MINUTES } from "../constant/passwordReset.js";
import { sendTemplatedEmail, hashEmailForLog } from "../email/email.service.js";
import { EMAIL_JOB_TYPES } from "./email.types.js";

let workerHealthy = false;

export function isEmailWorkerHealthy() {
  if (env.isTest) return true;
  return workerHealthy;
}

export async function processPasswordResetEmailJob({ email, otp, resetId }) {
  try {
    await sendTemplatedEmail(EMAIL_TEMPLATE_TYPES.PASSWORD_RESET_OTP, email, {
      otp,
      expiresMinutes: OTP_EXPIRES_MINUTES,
    });

    await PasswordReset.findByIdAndUpdate(resetId, {
      emailStatus: "sent",
      emailSentAt: new Date(),
      $unset: { lastEmailError: 1 },
    });

    logger.info(
      { emailHash: hashEmailForLog(email), resetId, jobType: EMAIL_JOB_TYPES.PASSWORD_RESET_OTP },
      "password_reset_email_delivered",
    );
  } catch (err) {
    const smtpCode = err?.code ?? "UNKNOWN";

    await PasswordReset.findByIdAndUpdate(resetId, {
      emailStatus: "failed",
      lastEmailError: err.message,
    }).catch(() => {});

    logger.error(
      {
        emailHash: hashEmailForLog(email),
        resetId,
        smtpCode,
        err: err.message,
        jobType: EMAIL_JOB_TYPES.PASSWORD_RESET_OTP,
      },
      "password_reset_email_failed",
    );

    throw err;
  }
}

export async function processEmailJob(jobData) {
  if (jobData.type === EMAIL_JOB_TYPES.PASSWORD_RESET_OTP) {
    await processPasswordResetEmailJob(jobData);
    return;
  }

  throw new Error(`Unknown email job type: ${jobData.type}`);
}

export function setEmailWorkerHealthy(healthy) {
  workerHealthy = healthy;
}
