import { connectDB } from "../src/config/mongoDB.js";
import ShiftSchedule from "../src/models/rfid/shiftSchedule.model.js";
import { env } from "../src/config/env.js";

const DEFAULT_SHIFTS = [
  { shift: "morning", startTime: "6:00 AM", endTime: "2:00 PM" },
  { shift: "evening", startTime: "2:00 PM", endTime: "10:00 PM" },
  { shift: "night", startTime: "10:00 PM", endTime: "6:00 AM" },
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
