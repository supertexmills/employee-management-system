import { Router } from "express";
import * as rfidController from "../controllers/rfid/rfid.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorizeAttendanceAction } from "../middleware/rbac.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  listRfidEventsQuerySchema,
  listUnknownTagsQuerySchema,
  rfidStreamQuerySchema,
} from "../validators/rfid.validator.js";

const router = Router();

router.use(authenticate);

router.get(
  "/events/stream",
  authorizeAttendanceAction("read"),
  validate(rfidStreamQuerySchema, "query"),
  rfidController.streamEvents
);

router.get(
  "/events",
  authorizeAttendanceAction("read"),
  validate(listRfidEventsQuerySchema, "query"),
  rfidController.listEvents
);

router.get(
  "/unknown-tags",
  authorizeAttendanceAction("read"),
  validate(listUnknownTagsQuerySchema, "query"),
  rfidController.listUnknownTags
);

router.get(
  "/readers/status",
  authorizeAttendanceAction("read"),
  rfidController.readerStatus
);

export default router;
