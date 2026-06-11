import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as authController from "../controllers/auth/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { loginSchema, registerSchema } from "../validators/auth.validator.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: "Too many requests, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/login", authLimiter, validate(loginSchema), authController.login);
router.post("/refresh", authLimiter, authController.refresh);
router.post("/logout", authenticate, authController.logout);
router.post("/register", authenticate, validate(registerSchema), authController.register);
router.get("/me", authenticate, authController.me);

export default router;
