import Machine from "../../models/production/machine.model.js";
import Reader from "../../models/production/reader.model.js";
import { AppError } from "../../utils/AppError.js";
import { assertCanReadProduction, assertCanManageProduction } from "../rbac.service.js";
import { refreshMachineInCache } from "./roundCounter.service.js";
import { getSettings } from "../admin/factorySettings.service.js";

export async function listMachines(actor, query) {
  assertCanReadProduction(actor);

  const filter = {};
  if (query.department) filter.department = query.department;
  if (query.isActive !== undefined) filter.isActive = query.isActive;

  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Machine.find(filter).populate("reader").sort({ machineId: 1 }).skip(skip).limit(limit).lean(),
    Machine.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
}

export async function getMachine(actor, machineId) {
  assertCanReadProduction(actor);

  const machine = await Machine.findOne({ machineId }).populate("reader").lean();
  if (!machine) throw new AppError("Machine not found", 404);
  return machine;
}

export async function createMachine(actor, body) {
  assertCanManageProduction(actor);

  const reader = await Reader.findOne({ readerId: body.readerId, isActive: true });
  if (!reader) throw new AppError("Reader not found", 404);

  const existing = await Machine.findOne({ reader: reader._id });
  if (existing) throw new AppError("Reader already linked to a machine", 409);

  const machine = await Machine.create({
    machineId: body.machineId,
    name: body.name,
    department: body.department,
    defaultShift: body.defaultShift ?? "morning",
    reader: reader._id,
    location: body.location,
    minRoundIntervalSeconds:
      body.minRoundIntervalSeconds ?? getSettings().defaultMinRoundIntervalSeconds,
    targetRoundsPerShift: body.targetRoundsPerShift ?? null,
    createdBy: actor._id,
  });

  await Reader.findByIdAndUpdate(reader._id, { machine: machine._id });

  const populated = await Machine.findById(machine._id).populate("reader").lean();
  refreshMachineInCache(populated, populated.reader);
  return populated;
}

export async function updateMachine(actor, machineId, body) {
  assertCanManageProduction(actor);

  const machine = await Machine.findOne({ machineId });
  if (!machine) throw new AppError("Machine not found", 404);

  const updates = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.department !== undefined) updates.department = body.department;
  if (body.defaultShift !== undefined) updates.defaultShift = body.defaultShift;
  if (body.location !== undefined) updates.location = body.location;
  if (body.minRoundIntervalSeconds !== undefined) {
    updates.minRoundIntervalSeconds = body.minRoundIntervalSeconds;
  }
  if (body.targetRoundsPerShift !== undefined) {
    updates.targetRoundsPerShift = body.targetRoundsPerShift;
  }
  if (body.isActive !== undefined) updates.isActive = body.isActive;

  const updated = await Machine.findOneAndUpdate(
    { machineId },
    { $set: updates },
    { new: true }
  )
    .populate("reader")
    .lean();

  refreshMachineInCache(updated, updated.reader);
  return updated;
}

export async function deactivateMachine(actor, machineId) {
  assertCanManageProduction(actor);

  const machine = await Machine.findOneAndUpdate(
    { machineId },
    { $set: { isActive: false } },
    { new: true }
  ).lean();

  if (!machine) throw new AppError("Machine not found", 404);
  return machine;
}
