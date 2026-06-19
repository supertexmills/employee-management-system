import { connectDB } from "./config/mongoDB.js";
import { env } from "./config/env.js";
import { seedShiftSchedulesIfEmpty } from "../scripts/seedShiftSchedules.js";
import { seedProductionIfEmpty } from "../scripts/seedProduction.js";
import { hydrateRfidCaches } from "./services/rfid/rfidEvent.service.js";
import { hydrateProductionCaches } from "./services/production/roundCounter.service.js";
import { startRfidReader } from "./services/rfid/rfidReader.service.js";
import { startAttendanceScheduler } from "./services/attendance/attendanceScheduler.service.js";

export async function bootstrap() {
  await connectDB();
  await seedShiftSchedulesIfEmpty();
  await seedProductionIfEmpty();
  await hydrateRfidCaches();
  await hydrateProductionCaches();

  if (env.rfidEnabled) {
    startRfidReader();
  } else {
    console.log("RFID reader disabled (RFID_ENABLED=false)");
  }

  startAttendanceScheduler();
}
