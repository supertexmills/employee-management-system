import cron from "node-cron";
import Employee from "../../models/employee/employee.model.js";
import EmployeePresence from "../../models/attendance/employeePresence.model.js";
import AttendanceDay from "../../models/attendance/attendanceDay.model.js";
import ShiftSchedule from "../../models/rfid/shiftSchedule.model.js";
import { env } from "../../config/env.js";
import { getFactoryDate, getShiftBounds } from "../../utils/factoryDate.js";
import { publishAttendanceChanged } from "../rfid/eventBus.js";

let cronTasks = [];

export function startAttendanceScheduler() {
  cronTasks.push(
    cron.schedule("*/15 * * * *", () => {
      void runAbsentCheck();
      void runOvertimeCheck();
    })
  );

  cronTasks.push(
    cron.schedule("*/10 * * * *", () => {
      void runMissingTagCheck();
    })
  );

  console.log("Attendance scheduler started");
}

export function stopAttendanceScheduler() {
  for (const task of cronTasks) {
    task.stop();
  }
  cronTasks = [];
}

async function runAbsentCheck() {
  const today = getFactoryDate();
  const now = new Date();
  const schedules = await ShiftSchedule.find().lean();
  const scheduleByShift = Object.fromEntries(schedules.map((s) => [s.shift, s]));

  const activeEmployees = await Employee.find({ isActive: true }).lean();

  for (const emp of activeEmployees) {
    const schedule = scheduleByShift[emp.shift];
    if (!schedule) continue;

    const { graceEndAt } = getShiftBounds(schedule, now);
    if (now < graceEndAt) continue;

    const day = await AttendanceDay.findOne({ employee: emp._id, date: today });
    if (day?.firstEntryAt) continue;

    await AttendanceDay.findOneAndUpdate(
      { employee: emp._id, date: today },
      {
        $set: {
          department: emp.department,
          shift: emp.shift,
          status: "ABSENT",
          currentState: "OUTSIDE",
        },
      },
      { upsert: true }
    );
  }

  publishAttendanceChanged();
}

async function runOvertimeCheck() {
  const today = getFactoryDate();
  const now = new Date();
  const schedules = await ShiftSchedule.find().lean();
  const scheduleByShift = Object.fromEntries(schedules.map((s) => [s.shift, s]));

  const insidePresence = await EmployeePresence.find({
    currentState: "INSIDE",
    todayDate: today,
  })
    .populate("employee", "shift department")
    .lean();

  for (const presence of insidePresence) {
    const emp = presence.employee;
    if (!emp) continue;

    const schedule = scheduleByShift[emp.shift];
    if (!schedule) continue;

    const { overtimeAt } = getShiftBounds(schedule, now);
    if (now < overtimeAt) continue;

    await AttendanceDay.findOneAndUpdate(
      { employee: emp._id, date: today },
      {
        $set: {
          department: emp.department,
          shift: emp.shift,
          status: "OVERTIME",
          isOvertime: true,
          currentState: "INSIDE",
        },
      },
      { upsert: true }
    );
  }

  publishAttendanceChanged();
}

async function runMissingTagCheck() {
  const today = getFactoryDate();
  const thresholdMs = env.missingTagThresholdMinutes * 60 * 1000;
  const cutoff = new Date(Date.now() - thresholdMs);

  const staleInside = await EmployeePresence.find({
    currentState: "INSIDE",
    todayDate: today,
    lastEventAt: { $lt: cutoff },
  })
    .populate("employee", "department shift")
    .lean();

  for (const presence of staleInside) {
    const emp = presence.employee;
    if (!emp) continue;

    await AttendanceDay.findOneAndUpdate(
      { employee: emp._id, date: today },
      {
        $set: {
          department: emp.department,
          shift: emp.shift,
          status: "MISSING_TAG",
          currentState: "INSIDE",
        },
        $addToSet: { flags: "MISSING_TAG" },
      },
      { upsert: true }
    );
  }

  if (staleInside.length > 0) {
    publishAttendanceChanged();
  }
}
