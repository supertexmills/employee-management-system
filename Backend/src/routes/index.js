import { Router } from "express";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { csrfProtection } from "../middleware/csrf.middleware.js";
import { env } from "../config/env.js";
import { getReaderStatus } from "../services/rfid/rfidReader.service.js";
import { getProductionHealth } from "../services/production/roundSummary.service.js";
import { getEmailHealthStatus } from "../email/email.service.js";
import { isEmailWorkerHealthy } from "../jobs/email.worker.js";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import employeeRoutes from "./employee.routes.js";
import productionRoutes from "./production.routes.js";
import mediaRoutes from "./media.routes.js";

const router = Router();

const noop = (_req, _res, next) => next();

const apiLimiter = env.isTest
  ? noop
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: { success: false, message: "Too many requests, try again later" },
      standardHeaders: true,
      legacyHeaders: false,
    });

router.get("/health", async (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbOk = dbState === 1;
  const production = await getProductionHealth().catch(() => ({ machinesActive: 0 }));
  const emailBase = getEmailHealthStatus();
  const workerOk = isEmailWorkerHealthy();
  const emailStatus =
    emailBase.status === "not_configured"
      ? "not_configured"
      : workerOk
        ? "ok"
        : "degraded";

  res.json({
    success: true,
    status: dbOk ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    db: dbOk ? "ok" : "disconnected",
    email: { status: emailStatus, provider: emailBase.provider },
    rfid: getReaderStatus(),
    production: {
      machinesActive: production.machinesActive,
    },
    env: env.nodeEnv,
  });
});

router.use(apiLimiter);
router.use(csrfProtection);
router.use("/auth", authRoutes);
router.use("/media", mediaRoutes);
router.use("/admins", adminRoutes);
router.use("/employees", employeeRoutes);
router.use("/v1/production", productionRoutes);

export default router;
