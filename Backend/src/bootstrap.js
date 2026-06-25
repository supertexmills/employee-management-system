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
  await hydrateEmployeeCache();
  await hydrateProductionCaches();

  if (!env.isTest) {
    await startEmailWorker();

    if (env.emailProvider !== "memory") {
      const smtpOk = await verifyEmailProvider().catch(() => false);
      if (!smtpOk && env.isProduction) {
        throw new Error("SMTP verification failed — check SMTP_USER/SMTP_PASS and network");
      }
      if (!smtpOk) {
        logger.warn("SMTP verification failed — emails will not send until configured");
      }
    }
  }

  if (env.rfidEnabled) {
    startRfidReader();
  } else {
    console.log("RFID reader disabled (RFID_ENABLED=false)");
  }
}
