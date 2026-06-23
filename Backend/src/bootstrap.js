import { connectDB } from "./config/mongoDB.js";
import { env } from "./config/env.js";
import { seedShiftSchedulesIfEmpty } from "../scripts/seedShiftSchedules.js";
import { seedProductionIfEmpty } from "../scripts/seedProduction.js";
import { hydrateEmployeeCache } from "./services/workforce/employeeCache.service.js";
import { hydrateProductionCaches } from "./services/production/roundCounter.service.js";
import { startRfidReader } from "./services/rfid/rfidReader.service.js";

export async function bootstrap() {
  await connectDB();
  await seedShiftSchedulesIfEmpty();
  await seedProductionIfEmpty();
  await hydrateEmployeeCache();
  await hydrateProductionCaches();

  if (env.rfidEnabled) {
    startRfidReader();
  } else {
    console.log("RFID reader disabled (RFID_ENABLED=false)");
  }
}
