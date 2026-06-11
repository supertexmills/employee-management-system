import { Router } from "express";
import * as adminController from "../controllers/admin/admin.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  listAdminQuerySchema,
  updateAdminSchema,
  adminIdParamSchema,
} from "../validators/admin.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", validate(listAdminQuerySchema, "query"), adminController.list);
router.get("/:id", validate(adminIdParamSchema, "params"), adminController.getById);
router.patch(
  "/:id",
  validate(adminIdParamSchema, "params"),
  validate(updateAdminSchema),
  adminController.update
);
router.delete("/:id", validate(adminIdParamSchema, "params"), adminController.remove);

export default router;
