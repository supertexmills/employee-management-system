import Employee from "../../models/employee/employee.model.js";
import Machine from "../../models/production/machine.model.js";
import MachineRound from "../../models/production/machineRound.model.js";
import MachineShiftSummary from "../../models/production/machineShiftSummary.model.js";
import { getFactoryDate } from "../../utils/factoryDate.js";
import {
  getScheduleByShift,
  getShiftHourIndex,
  resolveCurrentFactoryShift,
} from "../shift/shiftResolver.service.js";
import { getReaderStatus } from "../rfid/rfidReader.service.js";
import { assertCanReadProduction } from "../rbac.service.js";
import { AppError } from "../../utils/AppError.js";

function buildSummaryFilter(query = {}) {
  const factoryDate = query.factoryDate ?? getFactoryDate();
  const filter = { factoryDate };
  if (query.department) filter.department = query.department;
  if (query.shift) filter.shift = query.shift;
  if (query.machineId) filter.machineId = query.machineId;
  return { factoryDate, filter };
}

export async function getLiveSnapshot(query = {}) {
  const { factoryDate, filter } = buildSummaryFilter(query);
  const shift = query.shift ?? "morning";
  const schedule = await getScheduleByShift(shift);

  const machineFilter = { isActive: true };
  if (query.machineId) machineFilter.machineId = query.machineId;
  if (query.department) machineFilter.department = query.department;

  const machines = await Machine.find(machineFilter).populate("reader").lean();
  const readerStatus = getReaderStatus();
  const currentHourIndex = schedule ? getShiftHourIndex(new Date(), schedule) : 0;
  const activeShift = query.shift ?? shift;

  const machineStats = await Promise.all(
    machines.map(async (machine) => {
      const summaryFilter = {
        ...filter,
        machineId: machine.machineId,
        shift: activeShift,
      };

      const roundFilter = {
        machineId: machine.machineId,
        factoryDate,
        shift: activeShift,
      };
      if (query.department) roundFilter.department = query.department;

      const [summaries, lastRound, totalRoundsShift, roundsThisHour] = await Promise.all([
        MachineShiftSummary.find(summaryFilter).lean(),
        MachineRound.findOne({ machineId: machine.machineId })
          .sort({ detectedAt: -1 })
          .lean(),
        MachineRound.countDocuments(roundFilter),
        MachineRound.countDocuments({
          ...roundFilter,
          shiftHourIndex: currentHourIndex,
        }),
      ]);
      const linkedReaderId = machine.reader?.readerId;

      return {
        machineId: machine.machineId,
        name: machine.name,
        readerConnected:
          Boolean(linkedReaderId) &&
          readerStatus.readerId === linkedReaderId &&
          readerStatus.connected,
        lastRoundAt: lastRound?.detectedAt ?? null,
        roundsThisHour,
        totalRoundsShift,
        activeEmployees: summaries.filter((s) => s.totalRounds > 0).length,
      };
    })
  );

  const totals = machineStats.reduce(
    (acc, m) => ({
      roundsThisHour: acc.roundsThisHour + m.roundsThisHour,
      roundsTodayShift: acc.roundsTodayShift + m.totalRoundsShift,
    }),
    { roundsThisHour: 0, roundsTodayShift: 0 }
  );

  return {
    factoryDate,
    shift: query.shift ?? shift,
    currentShift: await resolveCurrentFactoryShift(),
    shiftWindow: schedule
      ? {
          start: schedule.startTime,
          end: schedule.endTime,
          timezone: schedule.timezone,
        }
      : null,
    machines: machineStats,
    totals,
    updatedAt: new Date().toISOString(),
  };
}

export async function getTodaySummary(actor, query = {}) {
  assertCanReadProduction(actor);
  const { factoryDate, filter } = buildSummaryFilter(query);

  const [summaries, machineCount] = await Promise.all([
    MachineShiftSummary.find(filter).lean(),
    Machine.countDocuments({ isActive: true, ...(query.department ? { department: query.department } : {}) }),
  ]);

  const totalRounds = summaries.reduce((sum, s) => sum + s.totalRounds, 0);
  const activeEmployees = new Set(summaries.map((s) => String(s.employee))).size;
  const hourlyMap = new Map();

  for (const summary of summaries) {
    for (const slot of summary.hourlyRounds) {
      const current = hourlyMap.get(slot.hourLabel) ?? 0;
      hourlyMap.set(slot.hourLabel, current + slot.rounds);
    }
  }

  const hourlyTotals = [...hourlyMap.entries()]
    .map(([hourLabel, rounds]) => ({ hourLabel, rounds }))
    .sort((a, b) => a.hourLabel.localeCompare(b.hourLabel));

  const topPerformers = [...summaries]
    .sort((a, b) => b.totalRounds - a.totalRounds)
    .slice(0, 10)
    .map((s) => ({
      employeeName: s.employeeName,
      machineId: s.machineId,
      totalRounds: s.totalRounds,
    }));

  return {
    factoryDate,
    shift: query.shift ?? null,
    totalRounds,
    activeMachines: machineCount,
    activeEmployees,
    avgRoundsPerEmployee: activeEmployees ? Math.round(totalRounds / activeEmployees) : 0,
    hourlyTotals,
    topPerformers,
  };
}

export async function getShiftSummary(actor, query) {
  assertCanReadProduction(actor);
  return getTodaySummary(actor, query);
}

export async function listRounds(actor, query) {
  assertCanReadProduction(actor);

  const filter = {};
  if (query.epc) filter.epc = query.epc.toUpperCase();
  if (query.employeeId) filter.employee = query.employeeId;
  if (query.machineId) filter.machineId = query.machineId;
  if (query.shift) filter.shift = query.shift;
  if (query.department) filter.department = query.department;
  if (query.factoryDate) filter.factoryDate = query.factoryDate;
  if (query.from || query.to) {
    filter.detectedAt = {};
    if (query.from) filter.detectedAt.$gte = query.from;
    if (query.to) filter.detectedAt.$lte = query.to;
  }

  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    MachineRound.find(filter).sort({ detectedAt: -1 }).skip(skip).limit(limit).lean(),
    MachineRound.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
}

export async function getRoundByKey(actor, roundKey) {
  assertCanReadProduction(actor);
  const round = await MachineRound.findOne({ roundKey }).lean();
  if (!round) throw new AppError("Round not found", 404);
  return round;
}

export async function getMachineSummary(actor, machineId, query = {}) {
  assertCanReadProduction(actor);

  const machine = await Machine.findOne({ machineId }).lean();
  if (!machine) throw new AppError("Machine not found", 404);

  const { filter } = buildSummaryFilter(query);
  filter.machineId = machineId;

  const summaries = await MachineShiftSummary.find(filter)
    .sort({ totalRounds: -1 })
    .lean();

  return { machine, summaries };
}

export async function getEmployeeSummary(actor, employeeId, query = {}) {
  assertCanReadProduction(actor);

  const employee = await Employee.findById(employeeId).lean();
  if (!employee) throw new AppError("Employee not found", 404);

  const { factoryDate, filter } = buildSummaryFilter(query);
  filter.employee = employeeId;
  if (query.machineId) filter.machineId = query.machineId;

  const summaries = await MachineShiftSummary.find(filter).lean();

  return {
    employee,
    factoryDate,
    shift: query.shift ?? summaries[0]?.shift ?? employee.shift,
    machines: summaries.map((s) => ({
      machineId: s.machineId,
      totalRounds: s.totalRounds,
      roundsThisHour: s.roundsThisHour,
      hourlyRounds: s.hourlyRounds,
      targetRoundsPerShift: s.targetRoundsPerShift,
      achievementPercent: s.achievementPercent,
      lastRoundAt: s.lastRoundAt,
    })),
  };
}

export async function getEmployeeHistory(actor, employeeId, query) {
  assertCanReadProduction(actor);

  const employee = await Employee.findById(employeeId).lean();
  if (!employee) throw new AppError("Employee not found", 404);

  const from = query.from ?? getFactoryDate();
  const to = query.to ?? from;
  const page = query.page ?? 1;
  const limit = query.limit ?? 30;
  const skip = (page - 1) * limit;

  const dayFilter = {
    employee: employeeId,
    factoryDate: { $gte: from, $lte: to },
  };
  if (query.machineId) dayFilter.machineId = query.machineId;

  const [data, total] = await Promise.all([
    MachineShiftSummary.find(dayFilter)
      .sort({ factoryDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    MachineShiftSummary.countDocuments(dayFilter),
  ]);

  return {
    employee,
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
}

export async function getProductionHealth() {
  const machinesActive = await Machine.countDocuments({ isActive: true });
  return { machinesActive };
}
