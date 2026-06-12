import Employee from "../../models/employee/employee.model.js";
import EmployeePresence from "../../models/attendance/employeePresence.model.js";
import AttendanceDay from "../../models/attendance/attendanceDay.model.js";
import { getFactoryDate } from "../../utils/factoryDate.js";
import { assertCanReadAttendance } from "../rbac.service.js";

function buildAttendanceFilter(filters = {}) {
  const today = getFactoryDate();
  const filter = { date: today };
  if (filters.department) filter.department = filters.department;
  if (filters.shift) filter.shift = filters.shift;
  return { today, filter };
}

export async function getLiveSummary(filters = {}) {
  const { today, filter } = buildAttendanceFilter(filters);

  const employeeFilter = { isActive: true };
  if (filters.department) employeeFilter.department = filters.department;
  if (filters.shift) employeeFilter.shift = filters.shift;

  let employeeIds = null;
  if (filters.department || filters.shift) {
    const employees = await Employee.find(employeeFilter).select("_id").lean();
    employeeIds = employees.map((e) => e._id);
  }

  const presenceFilter = { currentState: "INSIDE", todayDate: today };
  if (employeeIds) presenceFilter.employee = { $in: employeeIds };

  const [totalActive, insideNow, presentToday, absentToday, lateToday, overtimeNow, exitedToday] =
    await Promise.all([
      Employee.countDocuments(employeeFilter),
      EmployeePresence.countDocuments(presenceFilter),
      AttendanceDay.countDocuments({
        ...filter,
        firstEntryAt: { $ne: null },
      }),
      AttendanceDay.countDocuments({ ...filter, status: "ABSENT" }),
      AttendanceDay.countDocuments({ ...filter, isLate: true }),
      AttendanceDay.countDocuments({ ...filter, status: "OVERTIME" }),
      AttendanceDay.countDocuments({ ...filter, status: "EXITED" }),
    ]);

  return {
    date: today,
    totalActive,
    insideNow,
    presentToday,
    absentToday,
    lateToday,
    overtimeNow,
    exitedToday,
    updatedAt: new Date().toISOString(),
  };
}

export async function getLiveFloor(actor, query) {
  assertCanReadAttendance(actor);

  const { today, filter } = buildAttendanceFilter(query);
  if (query.status) filter.status = query.status;

  const page = query.page ?? 1;
  const limit = query.limit ?? 50;
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    AttendanceDay.find(filter)
      .populate("employee", "employeeId employeeName department shift rfid profilePicture")
      .sort({ status: 1, firstEntryAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AttendanceDay.countDocuments(filter),
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

export async function getTodaySummary(actor, query = {}) {
  assertCanReadAttendance(actor);
  return getLiveSummary(query);
}
