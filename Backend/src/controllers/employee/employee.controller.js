import * as employeeService from "../../services/employee.service.js";

export const create = async (req, res, next) => {
  try {
    const employee = await employeeService.createEmployee(req.user, req.body);
    res.status(201).json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    const result = await employeeService.listEmployees(req.user, req.validatedQuery);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getById = async (req, res, next) => {
  try {
    const employee = await employeeService.getEmployeeById(req.user, req.validatedParams.id);
    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const employee = await employeeService.updateEmployee(req.user, req.validatedParams.id, req.body);
    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await employeeService.deleteEmployee(req.user, req.validatedParams.id);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};
