import Employee from "../../models/employee/employee.model.js";
import RfidEvent from "../../models/rfid/rfidEvent.model.js";
import EmployeePresence from "../../models/attendance/employeePresence.model.js";
import { env } from "../../config/env.js";
import { processEvent } from "../attendance/attendanceEngine.service.js";
import { processRead } from "../production/roundCounter.service.js";
import { publishRfidEvent } from "./eventBus.js";
import { assertCanReadAttendance } from "../rbac.service.js";

const employeeByEpc = new Map();
const lastActionByEpc = new Map();
const recentReads = new Map();
const lastToggleAtByEpc = new Map();
let saveQueue = Promise.resolve();

export async function hydrateRfidCaches() {
  const [employees, presenceRows, recentActions] = await Promise.all([
    Employee.find({ isActive: true, rfid: { $exists: true, $ne: "" } })
      .select("employeeId employeeName department shift rfid")
      .lean(),
    EmployeePresence.find().select("epc lastAction").lean(),
    RfidEvent.aggregate([
      { $sort: { detectedAt: -1 } },
      { $group: { _id: "$epc", action: { $first: "$action" } } },
    ]),
  ]);

  employeeByEpc.clear();
  for (const emp of employees) {
    if (emp.rfid) employeeByEpc.set(emp.rfid.toUpperCase(), emp);
  }

  lastActionByEpc.clear();
  for (const row of presenceRows) {
    if (row.epc && row.lastAction) {
      lastActionByEpc.set(row.epc.toUpperCase(), row.lastAction);
    }
  }
  for (const row of recentActions) {
    if (row._id && row.action && row.action !== "UNKNOWN") {
      const epc = row._id.toUpperCase();
      if (!lastActionByEpc.has(epc)) {
        lastActionByEpc.set(epc, row.action);
      }
    }
  }

  console.log(
    `RFID caches ready: ${employeeByEpc.size} employees, ${lastActionByEpc.size} EPC states`
  );
}

function isDuplicate(epc) {
  const now = Date.now();
  const last = recentReads.get(epc);
  if (last && now - last < env.rfidDuplicateMs) return true;
  recentReads.set(epc, now);
  return false;
}

function getNextAction(epc) {
  const lastAction = lastActionByEpc.get(epc);
  if (!lastAction || lastAction === "EXIT") return "ENTRY";
  return "EXIT";
}

function canToggle(epc) {
  const lastToggle = lastToggleAtByEpc.get(epc);
  if (!lastToggle) return true;
  return Date.now() - lastToggle >= env.rfidAntiPassbackMs;
}

function buildIdempotencyKey(epc, readerId, detectedAt) {
  const bucket = Math.floor(detectedAt.getTime() / env.rfidDuplicateMs);
  return `${epc}:${readerId}:${bucket}`;
}

async function saveEvent(epc, rawHex, readerId, location) {
  if (env.productionModeOnly) {
    await processRead({ epc, readerId, rawHex, source: "TCP" });
    return;
  }

  // Machine round counting uses its own debounce; run in parallel with attendance.
  const roundTask = processRead({ epc, readerId, rawHex, source: "TCP" });

  if (isDuplicate(epc)) {
    console.log(`Duplicate ignored: ${epc}`);
    await roundTask;
    return;
  }

  let employee = employeeByEpc.get(epc);
  if (!employee) {
    employee = await Employee.findOne({
      isActive: true,
      rfid: { $regex: new RegExp(`^${epc}$`, "i") },
    })
      .select("employeeId employeeName department shift rfid")
      .lean();
    if (employee) employeeByEpc.set(epc, employee);
  }

  let action = "UNKNOWN";
  if (employee) {
    if (!canToggle(epc)) {
      console.log(`Anti-passback blocked: ${epc}`);
      await roundTask;
      return;
    }
    action = getNextAction(epc);
  }

  const detectedAt = new Date();
  const idempotencyKey = buildIdempotencyKey(epc, readerId, detectedAt);

  let event;
  try {
    event = await RfidEvent.create({
      epc,
      employee: employee?._id ?? null,
      employeeName: employee?.employeeName ?? "Unknown",
      action,
      readerId,
      location,
      rawHex,
      detectedAt,
      idempotencyKey,
    });
  } catch (err) {
    if (err.code === 11000) {
      console.log(`Idempotent duplicate: ${epc}`);
      await roundTask;
      return;
    }
    throw err;
  }

  if (employee && action !== "UNKNOWN") {
    lastActionByEpc.set(epc, action);
    lastToggleAtByEpc.set(epc, Date.now());
    await processEvent(event.toObject(), employee);
  }

  const payload = event.toObject();
  if (employee) {
    payload.employee = {
      _id: employee._id,
      employeeId: employee.employeeId,
      employeeName: employee.employeeName,
      department: employee.department,
      shift: employee.shift,
      rfid: employee.rfid,
    };
  }

  publishRfidEvent(payload);

  await roundTask;

  console.log("RFID EVENT SAVED:", {
    name: event.employeeName,
    epc,
    action,
    location,
  });
}

export function enqueueSave(epc, rawHex, readerId, location) {
  saveQueue = saveQueue
    .then(() => saveEvent(epc, rawHex, readerId, location))
    .catch((error) => {
      console.error("RFID save error:", error.message);
    });
}

export async function drainSaveQueue() {
  await saveQueue;
}

export async function listEvents(actor, query) {
  assertCanReadAttendance(actor);

  const filter = {};
  if (query.epc) filter.epc = query.epc.toUpperCase();
  if (query.employeeId) filter.employee = query.employeeId;
  if (query.action) filter.action = query.action;
  if (query.from || query.to) {
    filter.detectedAt = {};
    if (query.from) filter.detectedAt.$gte = query.from;
    if (query.to) filter.detectedAt.$lte = query.to;
  }

  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    RfidEvent.find(filter).sort({ detectedAt: -1 }).skip(skip).limit(limit).lean(),
    RfidEvent.countDocuments(filter),
  ]);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function listUnknownTags(actor, query = {}) {
  assertCanReadAttendance(actor);

  const limit = query.limit ?? 20;
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const rows = await RfidEvent.aggregate([
    { $match: { action: "UNKNOWN", detectedAt: { $gte: since } } },
    { $sort: { detectedAt: -1 } },
    {
      $group: {
        _id: "$epc",
        lastSeenAt: { $first: "$detectedAt" },
        count: { $sum: 1 },
        location: { $first: "$location" },
      },
    },
    { $sort: { lastSeenAt: -1 } },
    { $limit: limit },
  ]);

  return rows.map((r) => ({
    epc: r._id,
    lastSeenAt: r.lastSeenAt,
    count: r.count,
    location: r.location,
  }));
}

export function refreshEmployeeInCache(employee) {
  if (employee?.rfid) {
    employeeByEpc.set(employee.rfid.toUpperCase(), employee);
  }
}

export function getEmployeeByEpc(epc) {
  return employeeByEpc.get(epc.toUpperCase());
}
