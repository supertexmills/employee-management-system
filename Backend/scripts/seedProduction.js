import Admin from "../src/models/admin/admin.model.js";
import Reader from "../src/models/production/reader.model.js";
import Machine from "../src/models/production/machine.model.js";
import { initSettings, getSettings } from "../src/services/admin/factorySettings.service.js";
import { ROLES } from "../src/constant/roles.js";
import { connectDB } from "../src/config/mongoDB.js";

const DEFAULT_MACHINE_ID = "MILL_01";

export async function seedProductionIfEmpty() {
  const readerCount = await Reader.countDocuments();
  if (readerCount > 0) {
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

  const settings = getSettings();

  const reader = await Reader.create({
    readerId: "MILL_01_READER",
    type: "MACHINE",
    protocol: "BINARY_TCP",
    ip: "192.168.1.200",
    port: 200,
    location: "Spinning Mill 1",
    pollIntervalMs: 500,
    createdBy: admin._id,
  });

  const machine = await Machine.create({
    machineId: DEFAULT_MACHINE_ID,
    name: "Spinning Mill 1",
    department: "Production",
    defaultShift: "morning",
    reader: reader._id,
    location: "Spinning Mill 1",
    minRoundIntervalSeconds: settings.defaultMinRoundIntervalSeconds,
    createdBy: admin._id,
  });

  await Reader.findByIdAndUpdate(reader._id, { machine: machine._id });

  console.log(`Production seed: reader=${reader.readerId}, machine=${machine.machineId}`);
}

async function main() {
  await connectDB();
  await initSettings();
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
