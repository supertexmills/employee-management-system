import * as employeeService from "../../services/employee.service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const create = asyncHandler(async (req, res) => {
  const employee = await employeeService.createEmployee(req.user, req.body);
  res.status(201).json({ success: true, data: employee });
});

export const list = asyncHandler(async (req, res) => {
  const result = await employeeService.listEmployees(req.user, req.validatedQuery);
  res.json({ success: true, ...result });
});

export const getById = asyncHandler(async (req, res) => {
  const employee = await employeeService.getEmployeeById(req.user, req.validatedParams.id);
  res.json({ success: true, data: employee });
});

export const update = asyncHandler(async (req, res) => {
  const employee = await employeeService.updateEmployee(
    req.user,
    req.validatedParams.id,
    req.body,
  );
  res.json({ success: true, data: employee });
});

export const remove = asyncHandler(async (req, res) => {
  const result = await employeeService.deleteEmployee(req.user, req.validatedParams.id);
  res.json({ success: true, ...result });
});
