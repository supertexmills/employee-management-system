import express from "express";
import crypto from "crypto";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);

  app.use((req, res, next) => {
    const id = req.headers["x-request-id"] ?? crypto.randomUUID();
    req.id = id;
    res.setHeader("X-Request-Id", id);
    next();
  });

  app.use(
    helmet({
      // Keep SSE/streaming responses from being buffered or altered.
      crossOriginResourcePolicy: false,
    }),
  );
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

  return app;
}
