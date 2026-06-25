import { AppError } from "../utils/AppError.js";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);
const EXEMPT_PATHS = new Set([
  "/auth/login",
  "/auth/refresh",
  "/auth/forgot-password",
  "/auth/resend-otp",
  "/auth/reset-password",
]);

export function csrfProtection(req, res, next) {
  if (!MUTATING_METHODS.has(req.method.toUpperCase())) {
    return next();
  }

  if (EXEMPT_PATHS.has(req.path)) {
    return next();
  }

  const headerToken = req.headers["x-csrf-token"];
  const cookieToken = req.cookies?.csrfToken;

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    return next(new AppError("Invalid CSRF token", 403));
  }

  return next();
}
