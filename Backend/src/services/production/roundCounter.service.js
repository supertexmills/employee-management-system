import Employee from "../../models/employee/employee.model.js";
import Reader from "../../models/production/reader.model.js";
import Machine from "../../models/production/machine.model.js";
import MachineRound from "../../models/production/machineRound.model.js";
import MachineShiftSummary from "../../models/production/machineShiftSummary.model.js";
import { env } from "../../config/env.js";
import {
  resolveRoundContext,
  shouldCountOutsideShift,
} from "../shift/shiftResolver.service.js";
import { publishRoundEvent, publishProductionChanged } from "../rfid/eventBus.js";
import { markCounted, markRejected } from "../rfid/tagEvent.service.js";
import { checkDebounce, commitDebounce } from "../rfid/tagFilter.service.js";
import {
  getEmployeeByEpc,
  refreshEmployeeInCache,
} from "../workforce/employeeCache.service.js";

const readerByReaderId = new Map();
const machineByReaderId = new Map();

export async function hydrateProductionCaches() {
  const readers = await Reader.find({ isActive: true }).lean();
  readerByReaderId.clear();
  machineByReaderId.clear();

  for (const reader of readers) {
    readerByReaderId.set(reader.readerId, reader);
    if (reader.machine) {
      const machine = await Machine.findById(reader.machine).lean();
      if (machine?.isActive) {
        machineByReaderId.set(reader.readerId, machine);
      }
    }
  }

  const machines = await Machine.find({ isActive: true }).populate("reader").lean();
  for (const machine of machines) {
    if (machine.reader?.readerId) {
      machineByReaderId.set(machine.reader.readerId, machine);
      readerByReaderId.set(machine.reader.readerId, machine.reader);
    }
  }

  return {
    readers: readerByReaderId.size,
    machines: machineByReaderId.size,
  };
}

export function refreshMachineInCache(machine, reader) {
  if (reader?.readerId) {
    readerByReaderId.set(reader.readerId, reader);
    machineByReaderId.set(reader.readerId, machine);
  }
}

function buildRoundKey(epc, machineId, detectedAt, intervalSeconds) {
  const bucket = Math.floor(detectedAt.getTime() / (intervalSeconds * 1000));
  return `${epc}:${machineId}:${bucket}`;
}

async function resolveReaderAndMachine(readerId) {
  let reader = readerByReaderId.get(readerId);
  if (!reader) {
    reader = await Reader.findOne({ readerId, isActive: true }).lean();
    if (reader) readerByReaderId.set(readerId, reader);
  }

  let machine = machineByReaderId.get(readerId);
  if (!machine && reader?.machine) {
    machine = await Machine.findOne({ _id: reader.machine, isActive: true }).lean();
    if (machine) machineByReaderId.set(readerId, machine);
  }
  if (!machine) {
    machine = await Machine.findOne({ reader: reader?._id, isActive: true }).lean();
    if (machine) machineByReaderId.set(readerId, machine);
  }

  return { reader, machine };
}

async function lookupEmployee(epc) {
  let employee = getEmployeeByEpc(epc);
  if (!employee) {
    employee = await Employee.findOne({
      isActive: true,
      rfid: { $regex: new RegExp(`^${epc}$`, "i") },
    })
      .select("employeeId employeeName department shift rfid")
      .lean();
    if (employee) refreshEmployeeInCache(employee);
  }
  return employee;
}

async function upsertSummary({ employee, machine, context, detectedAt }) {
  const { shift, factoryDate, bounds, hourIndex, hourlySlots } = context;
  const target = machine.targetRoundsPerShift ?? null;

  const filter = {
    employee: employee._id,
    machineId: machine.machineId,
    factoryDate,
    shift,
  };

  let summary = await MachineShiftSummary.findOne(filter);

  if (!summary) {
    summary = await MachineShiftSummary.create({
      employee: employee._id,
      employeeName: employee.employeeName,
      employeeId: employee.employeeId,
      machine: machine._id,
      machineId: machine.machineId,
      department: employee.department,
      shift,
      factoryDate,
      shiftStartAt: bounds.startAt,
      shiftEndAt: bounds.endAt,
      totalRounds: 1,
      hourlyRounds: hourlySlots.map((slot) => ({
        hourIndex: slot.hourIndex,
        hourLabel: slot.hourLabel,
        rounds: slot.hourIndex === hourIndex ? 1 : 0,
      })),
      roundsThisHour: 1,
      currentHourIndex: hourIndex,
      lastRoundAt: detectedAt,
      targetRoundsPerShift: target,
      achievementPercent: target ? Math.round((1 / target) * 10000) / 100 : null,
    });
    return summary.toObject();
  }

  const incPath = `hourlyRounds.${hourIndex}.rounds`;
  const newTotal = summary.totalRounds + 1;
  const achievementPercent = target
    ? Math.round((newTotal / target) * 10000) / 100
    : null;

  summary = await MachineShiftSummary.findOneAndUpdate(
    filter,
    {
      $inc: {
        totalRounds: 1,
        [incPath]: 1,
      },
      $set: {
        roundsThisHour: (summary.hourlyRounds[hourIndex]?.rounds ?? 0) + 1,
        currentHourIndex: hourIndex,
        lastRoundAt: detectedAt,
        achievementPercent,
        employeeName: employee.employeeName,
        department: employee.department,
      },
    },
    { new: true }
  ).lean();

  return summary;
}

async function getMachineRoundStats(machineId, context) {
  const { factoryDate, shift, hourIndex } = context;
  const baseFilter = { machineId, factoryDate, shift };

  const [totalRoundsShift, roundsThisHour] = await Promise.all([
    MachineRound.countDocuments(baseFilter),
    MachineRound.countDocuments({ ...baseFilter, shiftHourIndex: hourIndex }),
  ]);

  return { totalRoundsShift, roundsThisHour };
}

export async function processRead({
  epc,
  readerId,
  rawHex = "",
  source = "TCP",
  eventId = null,
}) {
  const normalizedEpc = epc.toUpperCase();
  const detectedAt = new Date();

  const reject = async (reason) => {
    if (eventId) await markRejected(eventId, reason);
    return null;
  };

  const { reader, machine } = await resolveReaderAndMachine(readerId);
  if (!reader) {
    console.log(`Unknown reader: ${readerId}`);
    return reject("unknown_reader");
  }
  if (!machine) {
    console.log(`No machine linked to reader: ${readerId}`);
    return reject("no_machine");
  }

  const intervalSeconds =
    machine.minRoundIntervalSeconds ?? env.defaultMinRoundIntervalSeconds;

  const employee = await lookupEmployee(normalizedEpc);
  if (!employee) {
    console.warn(
      `Unregistered RFID tag: ${normalizedEpc} — assign this tag to an employee in the system`
    );
  }
  const context = await resolveRoundContext(
    detectedAt,
    employee?.shift,
    machine.defaultShift
  );

  if (!context.withinShift && !shouldCountOutsideShift()) {
    console.log(`Outside shift ignored: ${normalizedEpc}`);
    return reject("outside_shift");
  }

  const filterResult = checkDebounce({
    epc: normalizedEpc,
    machineId: machine.machineId,
    intervalSeconds,
  });

  if (!filterResult.accept) {
    console.log(`Debounce blocked: ${normalizedEpc} @ ${machine.machineId}`);
    return reject(filterResult.reason ?? "debounce");
  }

  const roundKey = buildRoundKey(
    normalizedEpc,
    machine.machineId,
    detectedAt,
    intervalSeconds
  );

  let round;
  try {
    round = await MachineRound.create({
      roundKey,
      epc: normalizedEpc,
      employee: employee?._id ?? null,
      employeeName: employee?.employeeName ?? "Unknown",
      employeeId: employee?.employeeId ?? null,
      machine: machine._id,
      machineId: machine.machineId,
      readerId,
      department: employee?.department ?? machine.department,
      shift: context.shift,
      factoryDate: context.factoryDate,
      shiftHourIndex: context.hourIndex,
      shiftHourLabel: context.hourLabel,
      detectedAt,
      withinShift: context.withinShift,
      source,
      rawHex,
    });
  } catch (err) {
    if (err.code === 11000) {
      console.log(`Idempotent round duplicate: ${roundKey}`);
      return reject("duplicate");
    }
    throw err;
  }

  commitDebounce({ epc: normalizedEpc, machineId: machine.machineId });

  let summary = null;
  if (employee) {
    summary = await upsertSummary({
      employee,
      machine,
      context,
      detectedAt,
    });
  }

  const machineStats = employee
    ? {
        totalRoundsShift: summary.totalRounds,
        roundsThisHour: summary.roundsThisHour,
      }
    : await getMachineRoundStats(machine.machineId, context);

  const payload = {
    roundKey: round.roundKey,
    machineId: machine.machineId,
    machineName: machine.name,
    employee: employee
      ? {
          _id: employee._id,
          employeeId: employee.employeeId,
          employeeName: employee.employeeName,
          department: employee.department,
          shift: employee.shift,
        }
      : null,
    shiftHourLabel: context.hourLabel,
    shiftHourIndex: context.hourIndex,
    roundsThisHour: machineStats.roundsThisHour,
    totalRoundsShift: machineStats.totalRoundsShift,
    detectedAt,
    factoryDate: context.factoryDate,
    shift: context.shift,
  };

  publishRoundEvent(payload);
  publishProductionChanged();

  if (eventId) {
    await markCounted(eventId, round.roundKey);
  }

  console.log("ROUND COUNTED:", {
    employee: employee?.employeeName ?? "Unregistered tag",
    epc: normalizedEpc,
    machine: machine.machineId,
    hour: context.hourLabel,
    totalRoundsShift: machineStats.totalRoundsShift,
    roundsThisHour: machineStats.roundsThisHour,
  });

  return payload;
}
