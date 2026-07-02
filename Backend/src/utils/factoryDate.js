import { getSettings } from "../services/admin/factorySettings.service.js";

function getTimeZone() {
  return getSettings().factoryTimezone;
}

export function getFactoryDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: getTimeZone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function parseTimeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

function getFactoryMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: getTimeZone(),
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return hour * 60 + minute;
}

export function getShiftBounds(shiftSchedule, date = new Date()) {
  const factoryDate = getFactoryDate(date);
  const startMinutes = parseTimeToMinutes(shiftSchedule.startTime);
  const endMinutes = parseTimeToMinutes(shiftSchedule.endTime);

  const crossesMidnight = endMinutes <= startMinutes;

  const startAt = buildDateInTimezone(factoryDate, shiftSchedule.startTime);
  let endAt = buildDateInTimezone(factoryDate, shiftSchedule.endTime);

  if (crossesMidnight) {
    const nextDay = addDaysToDateString(factoryDate, 1);
    endAt = buildDateInTimezone(nextDay, shiftSchedule.endTime);
  }

  return {
    startAt,
    endAt,
    crossesMidnight,
    currentMinutes: getFactoryMinutes(date),
    startMinutes,
    endMinutes,
  };
}

function buildDateInTimezone(dateStr, timeStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);

  const utcGuess = new Date(Date.UTC(year, month - 1, day, hours, minutes));
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: getTimeZone(),
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(utcGuess);
  const tzYear = Number(parts.find((p) => p.type === "year")?.value);
  const tzMonth = Number(parts.find((p) => p.type === "month")?.value);
  const tzDay = Number(parts.find((p) => p.type === "day")?.value);
  const tzHour = Number(parts.find((p) => p.type === "hour")?.value);
  const tzMinute = Number(parts.find((p) => p.type === "minute")?.value);

  const tzAsUtc = Date.UTC(tzYear, tzMonth - 1, tzDay, tzHour, tzMinute);
  const offset = tzAsUtc - utcGuess.getTime();
  return new Date(utcGuess.getTime() - offset);
}

function addDaysToDateString(dateStr, days) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + days));
  return d.toISOString().slice(0, 10);
}

export function isLateEntry(detectedAt, shiftSchedule) {
  const { startAt } = getShiftBounds(shiftSchedule, detectedAt);
  return detectedAt > startAt;
}
