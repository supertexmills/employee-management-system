import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  uploadAvatarMiddleware,
  handleUploadError,
} from "../middleware/upload.middleware.js";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
  updateProfileSchema,
} from "../validators/auth.validator.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many requests, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const avatarUploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many upload attempts, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authLimiter, authController.refresh);
router.post("/logout", authenticate, authController.logout);
router.post("/register", authenticate, validate(registerSchema), authController.register);
router.get("/me", authenticate, authController.me);
router.patch("/me", authenticate, validate(updateProfileSchema), authController.updateMe);
router.patch(
  "/me/password",
  authLimiter,
  authenticate,
  validate(changePasswordSchema),
  authController.changePassword,
);
router.post(
  "/me/avatar",
  avatarUploadLimiter,
  authenticate,
  uploadAvatarMiddleware,
  handleUploadError,
  authController.uploadAvatar,
);
router.delete("/me/avatar", authenticate, authController.removeAvatar);

export default router;
