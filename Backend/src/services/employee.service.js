import Employee from "../models/employee/employee.model.js";
import { AppError } from "../utils/AppError.js";
import { pickFields } from "../utils/pickFields.js";
import { buildTextSearchFilter, paginate } from "../utils/listQuery.js";
import { assertCanManageEmployee } from "./rbac.service.js";
import {
  refreshEmployeeInCache,
  removeEmployeeFromCache,
} from "./workforce/employeeCache.service.js";

const EMPLOYEE_CREATE_FIELDS = [
  "employeeName",
  "phoneNumber",
  "department",
  "designation",
  "rfid",
  "shift",
  "address",
  "joinedDate",
  "profilePicture",
];

const EMPLOYEE_UPDATE_FIELDS = [
  ...EMPLOYEE_CREATE_FIELDS,
  "isActive",
];

export async function createEmployee(actor, body) {
  assertCanManageEmployee(actor, "create");

  const payload = pickFields(body, EMPLOYEE_CREATE_FIELDS);
  const employee = await Employee.create({
    ...payload,
    createdBy: actor._id,
  });

  const result = employee.toObject();
  refreshEmployeeInCache(result);
  return result;
}

export async function listEmployees(actor, query) {
  assertCanManageEmployee(actor, "read");

  const filter = {
    ...(query.department && { department: query.department }),
    ...(query.shift && { shift: query.shift }),
    ...(query.isActive !== undefined && { isActive: query.isActive }),
    ...buildTextSearchFilter(query.search, ["employeeName", "employeeId", "rfid"]),
  };

  const { page, limit, skip } = paginate(query);

  const [data, total] = await Promise.all([
    Employee.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
    Employee.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getEmployeeById(actor, id) {
  assertCanManageEmployee(actor, "read");

  const employee = await Employee.findById(id);
  if (!employee) {
    throw new AppError("Employee not found", 404);
  }
  return employee.toObject();
}

export async function updateEmployee(actor, id, updates) {
  assertCanManageEmployee(actor, "update");

  const employee = await Employee.findById(id);
  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  const payload = pickFields(updates, EMPLOYEE_UPDATE_FIELDS);
  const previousRfid = employee.rfid;
  Object.assign(employee, payload);
  await employee.save();

  const result = employee.toObject();
  if (previousRfid && previousRfid !== result.rfid) {
    removeEmployeeFromCache(previousRfid);
  }
  if (result.isActive && result.rfid) {
    refreshEmployeeInCache(result);
  } else if (result.rfid) {
    removeEmployeeFromCache(result.rfid);
  }

  return result;
}

export async function deleteEmployee(actor, id) {
  assertCanManageEmployee(actor, "delete");

  const employee = await Employee.findById(id);
  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  const previousRfid = employee.rfid;
  employee.isActive = false;
  await employee.save();

  if (previousRfid) removeEmployeeFromCache(previousRfid);

  return { message: "Employee deactivated successfully" };
}
