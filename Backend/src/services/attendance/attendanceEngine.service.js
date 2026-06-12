import EmployeePresence from "../../models/attendance/employeePresence.model.js";
import AttendanceDay from "../../models/attendance/attendanceDay.model.js";
import ShiftSchedule from "../../models/rfid/shiftSchedule.model.js";
import { getFactoryDate, isLateEntry } from "../../utils/factoryDate.js";
import { publishAttendanceSummary } from "../rfid/eventBus.js";
import { getLiveSummary } from "./liveCount.service.js";

const shiftCache = new Map();

async function getShiftSchedule(shift) {
  if (shiftCache.has(shift)) return shiftCache.get(shift);
  const doc = await ShiftSchedule.findOne({ shift }).lean();
  if (doc) shiftCache.set(shift, doc);
  return doc;
}

function deriveStatus(action, isLate, hadEntryBefore) {
  if (action === "ENTRY") {
    if (isLate) return "LATE";
    return hadEntryBefore ? "INSIDE" : "PRESENT";
  }
  return "EXITED";
}

export async function processEvent(event, employee) {
  if (!employee) return;

  const today = getFactoryDate(event.detectedAt);
  const shiftSchedule = await getShiftSchedule(employee.shift);
  const isLate =
    event.action === "ENTRY" && shiftSchedule
      ? isLateEntry(event.detectedAt, shiftSchedule)
      : false;

  const existingDay = await AttendanceDay.findOne({
    employee: employee._id,
    date: today,
  }).lean();

  const hadEntryBefore = Boolean(existingDay?.firstEntryAt);

  await EmployeePresence.findOneAndUpdate(
    { employee: employee._id },
    {
      $set: {
        epc: event.epc,
        currentState: event.action === "ENTRY" ? "INSIDE" : "OUTSIDE",
        lastAction: event.action,
        lastEventAt: event.detectedAt,
        lastReaderId: event.readerId,
        lastLocation: event.location,
        todayDate: today,
        ...(event.action === "ENTRY" && !hadEntryBefore
          ? { todayFirstEntryAt: event.detectedAt }
          : {}),
      },
    },
    { upsert: true }
  );

  const status = deriveStatus(event.action, isLate, hadEntryBefore);
  const currentState = event.action === "ENTRY" ? "INSIDE" : "EXITED";

  const update = {
    department: employee.department,
    shift: employee.shift,
    status,
    currentState,
    isLate: event.action === "ENTRY" ? isLate : existingDay?.isLate ?? false,
    ...(event.action === "ENTRY" && !hadEntryBefore
      ? { firstEntryAt: event.detectedAt }
      : {}),
    ...(event.action === "EXIT" ? { lastExitAt: event.detectedAt } : {}),
  };

  await AttendanceDay.findOneAndUpdate(
    { employee: employee._id, date: today },
    { $set: update },
    { upsert: true }
  );

  const summary = await getLiveSummary();
  publishAttendanceSummary(summary);
}

export function clearShiftCache() {
  shiftCache.clear();
}
