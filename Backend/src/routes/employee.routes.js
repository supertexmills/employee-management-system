import { Router } from "express";
import * as employeeController from "../controllers/employee/employee.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeEmployeeAction } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  listEmployeeQuerySchema,
  employeeIdParamSchema,
} from "../validators/employee.validator.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorizeEmployeeAction("create"),
  validate(createEmployeeSchema),
  employeeController.create
);
router.get(
  "/",
  authorizeEmployeeAction("read"),
  validate(listEmployeeQuerySchema, "query"),
  employeeController.list
);
router.get(
  "/:id",
  authorizeEmployeeAction("read"),
  validate(employeeIdParamSchema, "params"),
  employeeController.getById
);
router.patch(
  "/:id",
  authorizeEmployeeAction("update"),
  validate(employeeIdParamSchema, "params"),
  validate(updateEmployeeSchema),
  employeeController.update
);
router.delete(
  "/:id",
  authorizeEmployeeAction("delete"),
  validate(employeeIdParamSchema, "params"),
  employeeController.remove
);

export default router;
