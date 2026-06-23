import Employee from "../models/employee/employee.model.js";
import { AppError } from "../utils/AppError.js";
import { assertCanManageEmployee } from "./rbac.service.js";
import {
  refreshEmployeeInCache,
  removeEmployeeFromCache,
} from "./workforce/employeeCache.service.js";

export async function createEmployee(actor, body) {
  assertCanManageEmployee(actor, "create");

  const employee = await Employee.create({
    ...body,
    createdBy: actor._id,
  });

  const result = employee.toObject();
  refreshEmployeeInCache(result);
  return result;
}

export async function listEmployees(actor, query) {
  assertCanManageEmployee(actor, "read");

  const filter = {};
  if (query.department) filter.department = query.department;
  if (query.shift) filter.shift = query.shift;
  if (query.isActive !== undefined) filter.isActive = query.isActive;

  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

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

  const previousRfid = employee.rfid;
  Object.assign(employee, updates);
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
