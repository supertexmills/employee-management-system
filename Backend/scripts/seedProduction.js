import dotenv from "dotenv";
import Admin from "../src/models/admin/admin.model.js";
import Reader from "../src/models/production/reader.model.js";
import Machine from "../src/models/production/machine.model.js";
import { env } from "../src/config/env.js";
import { ROLES } from "../src/constant/roles.js";
import { connectDB } from "../src/config/mongoDB.js";

dotenv.config();

const DEFAULT_MACHINE_ID = "MILL_01";

export async function seedProductionIfEmpty() {
  const readerCount = await Reader.countDocuments();
  if (readerCount > 0) {
    await Machine.updateMany(
      { minRoundIntervalSeconds: 120 },
      { $set: { minRoundIntervalSeconds: env.defaultMinRoundIntervalSeconds } }
    );
    return;
  }

  const admin = await Admin.findOne({
    role: ROLES.SUPER_ADMIN,
    status: "active",
  }).lean();

  if (!admin) {
    console.warn("Production seed skipped: no active super_admin found");
    return;
  }

  const reader = await Reader.create({
    readerId: env.rfidReaderId,
    type: "MACHINE",
    protocol: "BINARY_TCP",
    ip: env.rfidReaderIp,
    port: env.rfidReaderPort,
    location: env.rfidLocation,
    pollIntervalMs: env.rfidReaderPollMs,
    createdBy: admin._id,
  });

  const machine = await Machine.create({
    machineId: DEFAULT_MACHINE_ID,
    name: "Spinning Mill 1",
    department: "Production",
    defaultShift: "morning",
    reader: reader._id,
    location: env.rfidLocation,
    minRoundIntervalSeconds: env.defaultMinRoundIntervalSeconds,
    createdBy: admin._id,
  });

  await Reader.findByIdAndUpdate(reader._id, { machine: machine._id });

  console.log(`Production seed: reader=${reader.readerId}, machine=${machine.machineId}`);
}

async function main() {
  await connectDB();
  await Reader.deleteMany({});
  await Machine.deleteMany({});
  await seedProductionIfEmpty();
  process.exit(0);
}

const isDirectRun = process.argv[1]?.includes("seedProduction");
if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
