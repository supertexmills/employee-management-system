import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./src/config/mongoDB.js";
import { env } from "./src/config/env.js";
import routes from "./src/routes/index.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import { seedShiftSchedulesIfEmpty } from "./scripts/seedShiftSchedules.js";
import { hydrateRfidCaches } from "./src/services/rfid/rfidEvent.service.js";
import { startRfidReader, stopRfidReader } from "./src/services/rfid/rfidReader.service.js";
import {
  startAttendanceScheduler,
  stopAttendanceScheduler,
} from "./src/services/attendance/attendanceScheduler.service.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use("/api", routes);

app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

app.use(errorHandler);

let httpServer = null;

async function start() {
  await connectDB();
  await seedShiftSchedulesIfEmpty();
  await hydrateRfidCaches();

  if (env.rfidEnabled) {
    startRfidReader();
  } else {
    console.log("RFID reader disabled (RFID_ENABLED=false)");
  }

  startAttendanceScheduler();

  httpServer = app.listen(env.port, () => {
    console.log(`Server running on http://127.0.0.1:${env.port} [${env.nodeEnv}]`);
    console.log(`Health check: http://127.0.0.1:${env.port}/api/health`);
  });

  httpServer.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${env.port} is already in use. Stop the other process or change PORT in .env`
      );
    } else {
      console.error("Server failed to start:", err);
    }
    process.exit(1);
  });
}

async function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  stopAttendanceScheduler();
  await stopRfidReader();

  if (httpServer) {
    httpServer.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
