import Reader from "../../models/production/reader.model.js";
import Machine from "../../models/production/machine.model.js";
import { AppError } from "../../utils/AppError.js";
import { assertCanReadProduction, assertCanManageProduction } from "../rbac.service.js";
import { getReaderStatus } from "../rfid/rfidReader.service.js";
import { refreshMachineInCache } from "./roundCounter.service.js";

export async function listReaders(actor, query) {
  assertCanReadProduction(actor);

  const filter = {};
  if (query.type) filter.type = query.type;
  if (query.isActive !== undefined) filter.isActive = query.isActive;

  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    Reader.find(filter).sort({ readerId: 1 }).skip(skip).limit(limit).lean(),
    Reader.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
}

export async function getReadersStatus(actor) {
  assertCanReadProduction(actor);

  const readers = await Reader.find({ isActive: true }).lean();
  const tcpStatus = getReaderStatus();

  const data = await Promise.all(
    readers.map(async (reader) => {
      const machine = reader.machine
        ? await Machine.findById(reader.machine).select("machineId").lean()
        : null;

      const isTcpReader = reader.readerId === tcpStatus.readerId;

      return {
        readerId: reader.readerId,
        type: reader.type,
        machineId: machine?.machineId ?? null,
        connected: isTcpReader ? tcpStatus.connected : false,
        lastSeenAt: isTcpReader ? tcpStatus.lastSeenAt : reader.lastSeenAt,
        ip: reader.ip,
        port: reader.port,
        location: reader.location,
      };
    })
  );

  return data;
}

export async function createReader(actor, body) {
  assertCanManageProduction(actor);

  let machineId = null;
  if (body.machineId) {
    const machine = await Machine.findOne({ machineId: body.machineId });
    if (!machine) throw new AppError("Machine not found", 404);
    machineId = machine._id;
  }

  const reader = await Reader.create({
    readerId: body.readerId,
    type: body.type ?? "MACHINE",
    machine: machineId,
    ip: body.ip,
    port: body.port,
    location: body.location,
    pollIntervalMs: body.pollIntervalMs ?? 500,
    createdBy: actor._id,
  });

  if (machineId) {
    await Machine.findByIdAndUpdate(machineId, { reader: reader._id });
    const machine = await Machine.findById(machineId).lean();
    refreshMachineInCache(machine, reader.toObject());
  }

  return reader.toObject();
}

export async function updateReader(actor, readerId, body) {
  assertCanManageProduction(actor);

  const reader = await Reader.findOne({ readerId });
  if (!reader) throw new AppError("Reader not found", 404);

  const updates = {};
  if (body.type !== undefined) updates.type = body.type;
  if (body.ip !== undefined) updates.ip = body.ip;
  if (body.port !== undefined) updates.port = body.port;
  if (body.location !== undefined) updates.location = body.location;
  if (body.pollIntervalMs !== undefined) updates.pollIntervalMs = body.pollIntervalMs;
  if (body.isActive !== undefined) updates.isActive = body.isActive;

  if (body.machineId !== undefined) {
    const machine = await Machine.findOne({ machineId: body.machineId });
    if (!machine) throw new AppError("Machine not found", 404);
    updates.machine = machine._id;
    await Machine.findByIdAndUpdate(machine._id, { reader: reader._id });
  }

  const updated = await Reader.findOneAndUpdate(
    { readerId },
    { $set: updates },
    { new: true }
  ).lean();

  if (updated.machine) {
    const machine = await Machine.findById(updated.machine).lean();
    refreshMachineInCache(machine, updated);
  }

  return updated;
}
