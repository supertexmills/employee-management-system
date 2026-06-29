import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0] ?? "field";
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  logger.error(
    { err: err.message, stack: err.stack, requestId: req.id },
    "unhandled_error",
  );
  return res.status(500).json({
    success: false,
    message: env.isProduction ? "Internal server error" : err.message,
    ...(!env.isProduction && { stack: err.stack }),
  });
}
