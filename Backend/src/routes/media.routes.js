import { Router } from "express";
import * as mediaController from "../controllers/media/media.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { avatarUserIdParamSchema } from "../validators/media.validator.js";

const router = Router();

router.get(
  "/avatars/:userId",
  authenticate,
  validate(avatarUserIdParamSchema, "params"),
  mediaController.streamAvatar,
);

export default router;
