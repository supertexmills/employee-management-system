import ShiftSchedule from "../../models/rfid/shiftSchedule.model.js";
import { getFactoryDate, getShiftBounds } from "../../utils/factoryDate.js";
import { env } from "../../config/env.js";
import { SHIFTS } from "../../constant/factory.js";

const shiftCache = new Map();
const HOUR_MS = 60 * 60 * 1000;

export async function getScheduleByShift(shift) {
  if (shiftCache.has(shift)) return shiftCache.get(shift);
  const doc = await ShiftSchedule.findOne({ shift }).lean();
  if (doc) shiftCache.set(shift, doc);
  return doc;
}

export function clearShiftCache() {
  shiftCache.clear();
}

function parseTimeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function formatHourLabel(startTime, hourIndex) {
  const startMinutes = parseTimeToMinutes(startTime);
  const totalMinutes = (startMinutes + hourIndex * 60) % (24 * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function buildHourlySlots(schedule) {
  const startMinutes = parseTimeToMinutes(schedule.startTime);
  const endMinutes = parseTimeToMinutes(schedule.endTime);
  const crossesMidnight = endMinutes <= startMinutes;
  const durationMinutes = crossesMidnight
    ? 24 * 60 - startMinutes + endMinutes
    : endMinutes - startMinutes;
  const slotCount = Math.max(1, Math.floor(durationMinutes / 60));

  return Array.from({ length: slotCount }, (_, hourIndex) => ({
    hourIndex,
    hourLabel: formatHourLabel(schedule.startTime, hourIndex),
    rounds: 0,
  }));
}

export function getShiftHourIndex(detectedAt, schedule) {
  const bounds = getShiftBounds(schedule, detectedAt);
  const rawIndex = Math.floor((detectedAt.getTime() - bounds.startAt.getTime()) / HOUR_MS);
  const slots = buildHourlySlots(schedule);
  return Math.max(0, Math.min(rawIndex, slots.length - 1));
}

export function getShiftHourLabel(schedule, hourIndex) {
  return formatHourLabel(schedule.startTime, hourIndex);
}

export function isWithinShift(detectedAt, schedule) {
  const { startAt, endAt } = getShiftBounds(schedule, detectedAt);
  return detectedAt >= startAt && detectedAt <= endAt;
}

export async function resolveRoundContext(detectedAt, employeeShift, machineDefaultShift) {
  const shift = employeeShift ?? machineDefaultShift ?? "morning";
  const schedule = await getScheduleByShift(shift);
  if (!schedule) {
    throw new Error(`Shift schedule not found: ${shift}`);
  }

  const factoryDate = getFactoryDate(detectedAt);
  const bounds = getShiftBounds(schedule, detectedAt);
  const hourIndex = getShiftHourIndex(detectedAt, schedule);
  const hourLabel = getShiftHourLabel(schedule, hourIndex);
  const withinShift = isWithinShift(detectedAt, schedule);

  return {
    shift,
    schedule,
    factoryDate,
    bounds,
    hourIndex,
    hourLabel,
    withinShift,
    hourlySlots: buildHourlySlots(schedule),
  };
}

export function resolveShiftForTimestamp(detectedAt) {
  const factoryDate = getFactoryDate(detectedAt);
  return { factoryDate, shifts: SHIFTS };
}

export function shouldCountOutsideShift() {
  return env.countOutsideShift;
}
