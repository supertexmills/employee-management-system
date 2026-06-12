import dotenv from "dotenv";
import { connectDB } from "../src/config/mongoDB.js";
import ShiftSchedule from "../src/models/rfid/shiftSchedule.model.js";
import { env } from "../src/config/env.js";

dotenv.config();

const DEFAULT_SHIFTS = [
  { shift: "morning", startTime: "06:00", endTime: "14:00", graceMinutes: 15, overtimeAfterMinutes: 30 },
  { shift: "evening", startTime: "14:00", endTime: "22:00", graceMinutes: 15, overtimeAfterMinutes: 30 },
  { shift: "night", startTime: "22:00", endTime: "06:00", graceMinutes: 15, overtimeAfterMinutes: 30 },
];

export async function seedShiftSchedulesIfEmpty() {
  const count = await ShiftSchedule.countDocuments();
  if (count > 0) return;

  await ShiftSchedule.insertMany(
    DEFAULT_SHIFTS.map((s) => ({
      ...s,
      timezone: env.factoryTimezone,
    }))
  );

  console.log("Shift schedules seeded");
}

async function main() {
  await connectDB();
  await ShiftSchedule.deleteMany({});
  await seedShiftSchedulesIfEmpty();
  process.exit(0);
}

const isDirectRun = process.argv[1]?.includes("seedShiftSchedules");
if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
