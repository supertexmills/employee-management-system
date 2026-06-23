import { env } from "./src/config/env.js";
import { createApp } from "./src/app.js";
import { bootstrap } from "./src/bootstrap.js";
import { stopRfidReader } from "./src/services/rfid/rfidReader.service.js";

const app = createApp();

let httpServer = null;

async function start() {
  await bootstrap();

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
