import { Router } from "express";
import * as productionController from "../controllers/production/production.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeProductionAction } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  productionFilterQuerySchema,
  productionStreamQuerySchema,
  listRoundsQuerySchema,
  roundKeyParamSchema,
  machineIdParamSchema,
  readerIdParamSchema,
  employeeIdParamSchema,
  employeeHistoryQuerySchema,
  listMachinesQuerySchema,
  listReadersQuerySchema,
  createMachineBodySchema,
  updateMachineBodySchema,
  createReaderBodySchema,
  updateReaderBodySchema,
  shiftSummaryQuerySchema,
} from "../validators/production.validator.js";

const router = Router();

router.use(authenticate);

router.get(
  "/live",
  authorizeProductionAction("read"),
  validate(productionFilterQuerySchema, "query"),
  productionController.live
);

router.get(
  "/stream",
  authorizeProductionAction("read"),
  validate(productionStreamQuerySchema, "query"),
  productionController.stream
);

router.get(
  "/rounds",
  authorizeProductionAction("read"),
  validate(listRoundsQuerySchema, "query"),
  productionController.listRounds
);

router.get(
  "/rounds/:roundKey",
  authorizeProductionAction("read"),
  validate(roundKeyParamSchema, "params"),
  productionController.getRound
);

router.get(
  "/summary/today",
  authorizeProductionAction("read"),
  validate(productionFilterQuerySchema, "query"),
  productionController.todaySummary
);

router.get(
  "/summary/shift",
  authorizeProductionAction("read"),
  validate(shiftSummaryQuerySchema, "query"),
  productionController.shiftSummary
);

router.get(
  "/machines",
  authorizeProductionAction("read"),
  validate(listMachinesQuerySchema, "query"),
  productionController.listMachines
);

router.post(
  "/machines",
  authorizeProductionAction("manage"),
  validate(createMachineBodySchema, "body"),
  productionController.createMachine
);

router.get(
  "/machines/:machineId/summary",
  authorizeProductionAction("read"),
  validate(machineIdParamSchema, "params"),
  validate(productionFilterQuerySchema, "query"),
  productionController.machineSummary
);

router.get(
  "/machines/:machineId",
  authorizeProductionAction("read"),
  validate(machineIdParamSchema, "params"),
  productionController.getMachine
);

router.patch(
  "/machines/:machineId",
  authorizeProductionAction("manage"),
  validate(machineIdParamSchema, "params"),
  validate(updateMachineBodySchema, "body"),
  productionController.updateMachine
);

router.delete(
  "/machines/:machineId",
  authorizeProductionAction("manage"),
  validate(machineIdParamSchema, "params"),
  productionController.deleteMachine
);

router.get(
  "/readers",
  authorizeProductionAction("read"),
  validate(listReadersQuerySchema, "query"),
  productionController.listReaders
);

router.get(
  "/readers/status",
  authorizeProductionAction("read"),
  productionController.readersStatus
);

router.post(
  "/readers",
  authorizeProductionAction("manage"),
  validate(createReaderBodySchema, "body"),
  productionController.createReader
);

router.patch(
  "/readers/:readerId",
  authorizeProductionAction("manage"),
  validate(readerIdParamSchema, "params"),
  validate(updateReaderBodySchema, "body"),
  productionController.updateReader
);

router.get(
  "/employees/:id/summary",
  authorizeProductionAction("read"),
  validate(employeeIdParamSchema, "params"),
  validate(productionFilterQuerySchema, "query"),
  productionController.employeeSummary
);

router.get(
  "/employees/:id/history",
  authorizeProductionAction("read"),
  validate(employeeIdParamSchema, "params"),
  validate(employeeHistoryQuerySchema, "query"),
  productionController.employeeHistory
);

export default router;
