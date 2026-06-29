import { env } from "./src/config/env.js";
import { createApp } from "./src/app.js";
import { bootstrap } from "./src/bootstrap.js";
import { logger } from "./src/config/logger.js";
import { stopRfidReader } from "./src/services/rfid/rfidReader.service.js";
import { stopEmailWorker } from "./src/jobs/email.queue.js";

const app = createApp();

let httpServer = null;

async function start() {
  const boot = await bootstrap();

  httpServer = app.listen(env.port, () => {
    logger.info(
      {
        boot,
        url: `http://127.0.0.1:${env.port}`,
        health: `http://127.0.0.1:${env.port}/api/health`,
      },
      "Server ready",
    );
  });

  httpServer.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      logger.error(
        { port: env.port },
        "Port already in use — stop the other process or change PORT in .env",
      );
    } else {
      logger.error({ err: err.message }, "Server failed to start");
    }
    process.exit(1);
  });
}

async function shutdown(signal) {
  logger.info({ signal }, "Shutting down");
  await stopRfidReader();
  await stopEmailWorker();

  if (httpServer) {
    httpServer.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

start().catch((err) => {
  logger.error({ err: err.message }, "Failed to start server");
  process.exit(1);
});
