import { Router } from "express";
import rateLimit from "express-rate-limit";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import employeeRoutes from "./employee.routes.js";

const router = Router();

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: "Too many requests, try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/health", (_req, res) => {
  res.json({ success: true, status: "ok", timestamp: new Date().toISOString() });
});

router.use(apiLimiter);
router.use("/auth", authRoutes);
router.use("/admins", adminRoutes);
router.use("/employees", employeeRoutes);

export default router;
