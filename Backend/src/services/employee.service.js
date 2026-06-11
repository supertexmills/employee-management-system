import Employee from "../models/employee/employee.model.js";
import { AppError } from "../utils/AppError.js";
import { assertCanManageEmployee } from "./rbac.service.js";

export async function createEmployee(actor, body) {
  assertCanManageEmployee(actor, "create");

  const employee = await Employee.create({
    ...body,
    createdBy: actor._id,
  });

  return employee.toObject();
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

  Object.assign(employee, updates);
  await employee.save();
  return employee.toObject();
}

export async function deleteEmployee(actor, id) {
  assertCanManageEmployee(actor, "delete");

  const employee = await Employee.findById(id);
  if (!employee) {
    throw new AppError("Employee not found", 404);
  }

  employee.isActive = false;
  await employee.save();

  return { message: "Employee deactivated successfully" };
}
