import { connectDB } from "./config/mongoDB.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { seedShiftSchedulesIfEmpty } from "../scripts/seedShiftSchedules.js";
import { seedProductionIfEmpty } from "../scripts/seedProduction.js";
import { hydrateEmployeeCache } from "./services/workforce/employeeCache.service.js";
import { hydrateProductionCaches } from "./services/production/roundCounter.service.js";
import { startRfidReader } from "./services/rfid/rfidReader.service.js";
import { verifyEmailProvider } from "./email/email.service.js";
import { startEmailWorker } from "./jobs/email.queue.js";

export async function bootstrap() {
  await connectDB();
  await seedShiftSchedulesIfEmpty();
  await seedProductionIfEmpty();

  const employeeTags = await hydrateEmployeeCache();
  const { readers, machines } = await hydrateProductionCaches();

  let email = env.isTest ? "test" : env.redisUrl ? "queue" : "inline";

  if (!env.isTest) {
    await startEmailWorker({ quiet: true });

    if (env.emailProvider !== "memory") {
      const smtpOk = await verifyEmailProvider().catch(() => false);
      if (!smtpOk && env.isProduction) {
        throw new Error("SMTP verification failed — check SMTP_USER/SMTP_PASS and network");
      }
      if (!smtpOk) {
        email = "smtp-unverified";
      }
    }
  }

  if (env.rfidEnabled) {
    startRfidReader();
  }

  return {
    db: "ok",
    employeeTags,
    readers,
    machines,
    redis: env.redisUrl ? "on" : "off",
    email,
    rfid: env.rfidEnabled ? "on" : "off",
    otpEphemeral: env.otpPepperEphemeral,
  };
}
