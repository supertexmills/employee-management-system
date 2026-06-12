import Employee from "../../models/employee/employee.model.js";
import AttendanceDay from "../../models/attendance/attendanceDay.model.js";
import RfidEvent from "../../models/rfid/rfidEvent.model.js";
import { getFactoryDate } from "../../utils/factoryDate.js";
import { AppError } from "../../utils/AppError.js";
import { assertCanReadAttendance } from "../rbac.service.js";

export async function getEmployeeToday(actor, employeeId) {
  assertCanReadAttendance(actor);

  const employee = await Employee.findById(employeeId).lean();
  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  const today = getFactoryDate();
  const [attendanceDay, recentEvents] = await Promise.all([
    AttendanceDay.findOne({ employee: employeeId, date: today }).lean(),
    RfidEvent.find({ employee: employeeId, detectedAt: { $gte: startOfFactoryDay(today) } })
      .sort({ detectedAt: -1 })
      .limit(20)
      .lean(),
  ]);

  return {
    employee,
    attendanceDay,
    recentEvents,
  };
}

export async function getEmployeeHistory(actor, employeeId, query) {
  assertCanReadAttendance(actor);

  const employee = await Employee.findById(employeeId).lean();
  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  const from = query.from ?? getFactoryDate();
  const to = query.to ?? from;

  const page = query.page ?? 1;
  const limit = query.limit ?? 30;
  const skip = (page - 1) * limit;

  const dayFilter = {
    employee: employeeId,
    date: { $gte: from, $lte: to },
  };

  const [days, total] = await Promise.all([
    AttendanceDay.find(dayFilter).sort({ date: -1 }).skip(skip).limit(limit).lean(),
    AttendanceDay.countDocuments(dayFilter),
  ]);

  return {
    employee,
    data: days,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

function startOfFactoryDay(dateStr) {
  return new Date(`${dateStr}T00:00:00.000Z`);
}
